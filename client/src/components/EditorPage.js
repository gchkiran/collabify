 import React, { useEffect, useRef, useState } from 'react'
import Client from './Client';
import Editor from './Editor';
import { initSocket } from '../socket';
import { useNavigate, useLocation, useParams} from 'react-router-dom';
import { toast} from 'react-hot-toast';
import axios from "axios";

const LANGUAGES = [
  "python3",
  "java",
  "cpp",
  "nodejs",
  "c",
  "ruby",
  "go",
  "scala",
  "bash",
  "sql",
  "pascal",
  "csharp",
  "php",
  "swift",
  "rust",
  "r",
];

 
 function EditorPage() {
  const [clients, setClients] = useState([]);
  const [output, setOutput] = useState("");
  const [isCompileWindowOpen, setIsCompileWindowOpen] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("python3");

  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const {roomId} = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const init = async() => {
      socketRef.current = await initSocket();
      socketRef.current.on('connect_error', (err) => handleError(err))
      socketRef.current.on('connect_failed', (err) => handleError(err))

      const handleError = (err) => {
        console.error('Socket error => ' , err);
        toast.message("Socket connection failed")
        navigate('/')
      };

      socketRef.current.emit('join', {
        roomId, 
        username: location.state?.username,
      })

      socketRef.current.on("joined",({clients, username, socketId}) => {
        if(username !== location.state?.username){
          toast.success(`${username} joined`)
        }
        setClients(clients)
        socketRef.current.emit('sync-code', {
          code: codeRef.current,
          socketId
        })
      });
 

      socketRef.current.on("disconnected",({socketId, username}) => {
        toast.success(`${username} left`)
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId)
        })
      });
    };
    init();

    return () => {
      socketRef.current.disconnect()
      socketRef.current.off("joined")
      socketRef.current.off("disconnected")
    }
  }, [])

  if(! location.state){
    return <navigate to ="/" />
  }

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId)
      toast.success('Room ID copied to clipboard')
    } catch(error){
      toast.error("Unable to copy room id")
    }
  }

  const leaveRoom = () => {
    navigate('/');
  }

  const runCode = async () => {
    setIsCompiling(true);
    try {
      const response = await axios.post("http://localhost:5028/compile", {
        code: codeRef.current,
        language: selectedLanguage,
      });
      console.log("Backend response:", response.data);
      setOutput(response.data.output || JSON.stringify(response.data));
    } catch (error) {
      console.error("Error compiling code:", error);
      setOutput(error.response?.data?.error || "An error occurred");
    } finally {
      setIsCompiling(false);
    }
  };

  const toggleCompileWindow = () => {
    setIsCompileWindowOpen(!isCompileWindowOpen);
  };

   return (
     <div className='container-fluid vh-100' >
      <div className='row h-100'>
        <div className='col-md-2' style={{ backgroundColor: '#A3C9D3', color: '#FFFFFF' }}>
          <div 
            className='d-flex flex-column h-100'
            style = {{boxShadow: "2px 0px 4px rgba(A3,C9,D9,0.5)" }}
          >
          <img 
            className='img-fluid mx-auto d-block' 
            src='/images/collabify-logo.png' 
            alt='Collabify'
            style={{
              maxWidth: '200px',
              marginTop: '-43px'
            }} 
            />
            <hr style={{marginTop: '-3rem'}}/>

            {/* Clients */}
            <div className="d-flex flex-column overflow-auto">
              {
                clients.map((client => (
                  <Client key={client.socketId} username={client.username} />
                )))
              }
            </div>

            {/* Buttons */}
            <div className="mt-auto">
              <hr />
              <button onClick={copyRoomId} className="btn btn-success">
                Copy Room Id
              </button>
              <button onClick={leaveRoom} className="btn btn-danger mt-2 mb-2 px-3 btn-block">
                Leave Room
              </button>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className='col-md-10 text-dark' style={{ backgroundColor: '#FFFFFF', color: '#333333' }}>
          
          {/* Language selector */}
          <div className="bg-light p-2 d-flex justify-content-end">
            <select
              className="form-select w-auto"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
          
          <div className='d-flex flex-column h-100'>
            <h3 className='text-primary' style={{ padding: '4px' }}>
              <Editor 
                socketRef = {socketRef} 
                roomId = {roomId}
                onCodeChange = {(code) => {
                  (codeRef.current = code)
                }}/>
            </h3>
          </div>
        </div>
        <button
        className="btn btn-primary position-fixed bottom-0 end-0 m-3 col-md-2"
        onClick={toggleCompileWindow}
        style={{ zIndex: 1050 }}
      >
        {isCompileWindowOpen ? "Close Compiler" : "Open Compiler"}
      </button>

      {/* Compiler section */}
      <div
        className={`bg-dark text-light p-3 ${
          isCompileWindowOpen ? "d-block" : "d-none"
        }`}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: isCompileWindowOpen ? "30vh" : "0",
          transition: "height 0.3s ease-in-out",
          overflowY: "auto",
          zIndex: 1040,
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="m-0">Compiler Output ({selectedLanguage})</h5>
          <div>
            <button
              className="btn btn-success me-2"
              onClick={runCode}
              disabled={isCompiling}
            >
              {isCompiling ? "Compiling..." : "Run Code"}
            </button>
            <button className="btn btn-secondary" onClick={toggleCompileWindow}>
              Close
            </button>
          </div>
        </div>
        <pre className="bg-secondary p-3 rounded">
          {output || "Output will appear here after compilation"}
        </pre>
        </div>
      </div>
     </div>
   )
 }
 
 export default EditorPage
 