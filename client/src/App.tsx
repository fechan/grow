import { useEffect, useState } from 'react'
import './App.css'

// I'm ignoring type warnings for socket.io for now.
// I wrote all the server without typescript a while ago and I'm writing the
// client with TS, and to use types I need to write declarations for all the
// socket.io messages. I just want to bang out something that works now, so I'm
// leaving that for later. (https://socket.io/docs/v4/typescript/)
// @ts-ignore
import { socket } from './socket';

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return (
    <>
      <p>Hello world { isConnected.toString() }</p>
    </>
  )
}

export default App
