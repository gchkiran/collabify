import React from 'react'
import {v4 as uuid} from 'uuid'
import { toast} from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function Home() {
    const [roomId, setRoomId] = React.useState('');
    const [username, setUsername] = React.useState('');
    const navigate = useNavigate();

    const generateRoomId = (e) => {
        e.preventDefault();
        const id  = uuid();
        setRoomId(id);
        toast.success('Room Id is generated');
    };

    const joinRoom = (e) => {
        if(!roomId || !username){
            toast.error('Please enter both room id and username');
            return;
        }
        console.log(username)
        navigate(`/editor/${roomId}`, {
            state : {username} , 
        });
        toast.success('Room is created');
    };

  return (
    <div className='container-fluid'>
        <div className='row justify-content-center align-items-center min-vh-100'>
            <div className='col-12 col-md-6'>
                <div className='card shadow-sm p-2 mb-5' style={{ backgroundColor: '#A3C9D3' }}>
                    <div className='card-body text-center' style={{ backgroundColor: '#FFFFFF' }}>
                        <img 
                            className='img-fluid mx-auto d-block' 
                            src='/images/collabify-logo.png' 
                            alt='Collabify'
                            style={{
                              maxWidth: '200px'
                            }} 
                        />
                        <h4 className='text-primary'> Enter the room ID</h4>
                        <div className='form-group'>
                            <input 
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                type='text' 
                                className='form-control mb-2' 
                                placeholder='RoomId'
                                style={{ backgroundColor: '#F9F9F9', color: '#333333' }}
                            />
                        </div>
                        <div className='form-group'>
                            <input 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                type='text' 
                                className='form-control mb-2' 
                                placeholder='Username'
                                style={{ backgroundColor: '#F9F9F9', color: '#333333' }}
                            />
                        </div>
                        <button onClick={joinRoom} className='btn btn-success btn-lg btn-block' style={{ backgroundColor: '#388E3C' }}>Join</button>
                        <p className='mt-3' style={{ color: '#333333' }}>
                            Don't have a room Id? {" "}
                            <span 
                                className='text-success p-2' 
                                style={{cursor:"pointer"}}
                                onClick={generateRoomId}
                            >
                                New Room
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Home
