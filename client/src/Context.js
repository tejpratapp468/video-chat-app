import React, { createContext, useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';

const SocketContext = createContext();

// const socket = io('http://localhost:3000');
const socket = io('https://video-chat-app-tezz.herokuapp.com/');

const ContextProvider = ({ children }) => {
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState();
  const [name, setName] = useState('');
  const [call, setCall] = useState({});
  const [me, setMe] = useState('');

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }) // getting permissions from user is first thing as the components mount
      .then((currentStream) => {
        setStream(currentStream); // if user grants permission then this happens

        myVideo.current.srcObject = currentStream; // setting our video
      });

    socket.on('me', (id) => setMe(id)); // getting this id from backend this is my id

    socket.on('callUser', ({ from, name: callerName, signal }) => {
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    });
  }, []);

  const answerCall = () => {
    setCallAccepted(true);

    const peer = new Peer({ initiator: false, trickle: false, stream }); // {initiator:false} means we are not initiating we are simply answering the call.
    /* peer from which we are receiving the call */
    peer.on('signal', (data) => { // this will get our data
      socket.emit('answerCall', { signal: data, to: call.from });
    });

    peer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream; // setting other user's video stream of other person
    });

    peer.signal(call.signal); // signal represents signal's strength

    connectionRef.current = peer; // setting current connection to current peer
  };

  const callUser = (id) => { // userTocall id
    const peer = new Peer({ initiator: true, trickle: false, stream }); // we are initiator

    peer.on('signal', (data) => {
      socket.emit('callUser', { userToCall: id, signalData: data, from: me, name }); // call user with given 'id' // we know towhich user(caller,accepter) by
    });

    peer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);

      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true); // we ended the call

    connectionRef.current.destroy(); // destroy the specific connection stop receving i/p from user's camera and audio

    window.location.reload(); // reloads the page and provide the user a new id
  };

  return (
    <SocketContext.Provider value={{ // everything we will pass here will globally accesed by all ,all these components are wrapped into children
      call,
      callAccepted,
      myVideo,
      userVideo,
      stream,
      name,
      setName,
      callEnded,
      me,
      callUser,
      leaveCall,
      answerCall,
    }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };

