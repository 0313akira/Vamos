import { useState, useEffect } from 'react'
import './App.css'
import {auth,db} from'./firebase'
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore'
import {createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged,signOut }from 'firebase/auth'



function App() {
  // 新しい「状態」を作る

  const [text, setText] = useState("")
  const [name, setName] = useState("")
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [history, setHistory] = useState([])
  const [searchTag, setSearchTag] = useState("")
  const [currentView, setCurrentView] = useState("login")  // "post" なら投稿画面、"search" なら検索画面
  const [errorMessage,setErrorMessage] = useState("") //エラーメッセージを管理する
  const [user,setUser] = useState(null)




  //仕組み１：アプリ起動時にローカルストレージからデータを読み込む
  useEffect(() => {
    //　時間の新しい順に並び替える設定
    const q = query(collection(db,"posts"),orderBy("time","desc"));


    const unsubscribePosts = onSnapshot(q,(snapshot) => {
      const unsubscribePosts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text,
          name: data.name,
          time: data.time ? data.time.toDate().toLocaleString() : "" 
        }
      })
      setHistory(unsubscribePosts)
    })
    return() =>unsubscribePosts()
  },[])



  //仕組み２：history(リスト)が更新されるたびに、自動でローカルストレージに保存する
  useEffect(() =>{
    if(history.length > 0)
      {
      localStorage.setItem('mySavedList',JSON.stringify(history))
    }
  },[history])// 💡 [history] と書くことで、リストが変わるたびにこの中の処理が動く

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      setUser(currentUser)
      setCurrentView("home")
    } else {
      setUser(null)
      setCurrentView("login")
    }
  })
  return () => unsubscribe()
}, [])


  // 入力された文字を反映させる関数
  const handleInputChange = (event) => {
    // 入力された文字が200文字以下の場合のみ、状態を更新する。それ以上の場合は文字が入力できない。
    if (event.target.value.length <= 200
    ) {
      setText(event.target.value)
    }
  }
   
  const handleSignup= async()=>{
    try{
    await createUserWithEmailAndPassword(auth,email,password)// firebaseにメアドとパスワードを送信、登録する
    setPassword("")
    setEmail("")
    setName("")
    }catch(error){
      setErrorMessage("登録に失敗しました:" + error.code)
    }
    
    
   
  
        
  }

  //ログインのアカウントをチェックする
  const handleLogin = async () =>{

    //エラーメッセージを空にする
    setErrorMessage("")
    try{
      await signInWithEmailAndPassword(auth,email,password)

      setPassword("")
      setEmail("")

    }catch(error){
      setErrorMessage("ログインに失敗しました:" + error.code)
  }}

  //投稿するテキストを保存する
  const handleSave =  async () =>{


  
  if(text === "") return//空の時は保存しない


    if (!user){
      setErrorMessage("投稿するにはログインが必要です")
      setCurrentView("login")
      return
    }

    try{
      await addDoc(collection(db,"posts"),{
        text:text,
        name:user?.displayName || "ナナシさん",
        time:new Date()
      })
    

    const now = new Date()

    const timeString = now.toLocaleString()

    setHistory([{text: text, time: timeString }, ...history])//現在の文字を配列に追加する
    setText("")//入力欄を空にする
    setName("")//名前欄を空にする
    setCurrentView("home") // 保存した文章

  }catch(error){
    setErrorMessage("投稿に失敗しました:" + error.code)
  }}
  

  const handleDeleteItem = (indexToDelete) =>{
    const newHistory = history.filter((_, bangou) => bangou !== indexToDelete)

    if(newHistory.length === 0){
      localStorage.removeItem('mySavedList')
    }
    setHistory(newHistory)//新しいリストをセットして画面を更新する
  }
  

  const handleClearAll = ()=>{
    setHistory([])//リストを空にする
    localStorage.removeItem('mySavedList')//ローカルストレージのメモ帳もっ完全にけす
    
  }

  const filteredHistory = history.filter((item) => {
    // 投稿本文(item.text)に検索文字(searchTag)が含まれているかチェック
    return item.text.includes(searchTag)
  })

  // 💡 return の外側（関数の最初の方）で定義する
  const myTitleStyle = {
  textAlign: 'left'
  };


  return (
    
    <div>
    <button onClick={() => setCurrentView("home")}>ホーム</button>

    {user && (<button onClick={() => setCurrentView("post")}>投稿</button>)}
    <button onClick={() => setCurrentView("search")}>検索・閲覧</button>

    {user ? (<button onClick={() => setCurrentView("logout")}>ログアウト</button>)
     : <button onClick={() => setCurrentView("login")}>ログイン画面</button>}
    

 {currentView === "post" && (

      <div style={myTitleStyle}>
        {/* 📝 【ここに投稿用のパーツを引っ越す】 */}
        <h1>投稿画面</h1>
        
        <p>現在文字数: {}/200</p>
        <input  type="text" value={text} onChange={handleInputChange} placeholder="ここに文字を入力" />

        <button onClick={handleSave}>投稿</button>
      </div>
    )}{currentView === "login" &&(
      <div>
      <h1>ログイン画面</h1>
      <p>{errorMessage}</p>
      <input type = "text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder ="メールアドレス"/>
      <p></p>
      <input type = "text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder ="パスワード"/>
      <p></p>
      <button onClick={handleLogin}>ログイン</button>
      <p></p>
      <p></p>
      <button onClick={() => setCurrentView("signup")}>登録していない場合はこちら</button>

      </div>
      
    )}
      {currentView === "signup" && (
      <div style={myTitleStyle}>
        <h1>アカウント登録画面</h1>
        <p>{errorMessage}</p>
        
        <input  type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="名前を入力" />
        <p></p>
         <input type = "text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder ="メールアドレス"/>
        <p></p>
        <input type = "text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder ="パスワード"/>
        <button onClick={handleSignup}>登録</button>
        
      </div>
    )}

    {currentView === "search" && (
      <div style={myTitleStyle}>
        <h1>検索画面</h1>
    {/* 🔍 ここに入力欄（input）を追加します */}
    <input 
      type="text" 
      value={searchTag} 
      onChange={(e) => setSearchTag(e.target.value)} 
      placeholder="タグやキーワードで検索" 
    />

    {filteredHistory.map((item,index) =>(
      <p key = {index} style = {{marginBottom: "13px" }}>
        {item.name ? `${item.name}:`:""}
        {item.text}
        <br/>
        <span>{item.time}</span>
      </p>
    ))}
      </div>
    )}
    {currentView === "home" && (
      <div style={myTitleStyle}>
        <h1>ホーム画面</h1>
       {history.map((item, index) => (

  <p key={index} style = {{marginBottom: "13px"}}>
    {item.name ? `${item.name}：` :""}
    {item.text}
    <br
    />
    <span>{item.time}</span>
  </p>
  ))}
        
      </div>
    )}
   </div>
  )
}

export default App