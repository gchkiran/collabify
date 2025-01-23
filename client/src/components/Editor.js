import React, { useEffect, useRef, useState } from 'react'
import 'codemirror/theme/dracula.css'
import "codemirror/lib/codemirror.css"
import CodeMirror from 'codemirror'
import 'codemirror/addon/edit/closetag'
import 'codemirror/addon/edit/closebrackets'

import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python';
import 'codemirror/mode/ruby/ruby';
import 'codemirror/mode/php/php';


function Editor({socketRef, roomId, onCodeChange}) {
    const editorRef = useRef(null);

    useEffect(() => {
        const init = async () => {
            const editor = CodeMirror.fromTextArea(
                document.getElementById('realTimeEditor'),
                {
                    mode: { name: "javascript", json: true },
                    theme: "dracula",
                    lineNumbers: true,
                    autoCloseTags: true,
                   autoCloseBrackets: true,
                }
            );

            editorRef.current = editor;
            editor.setSize(null, '125%');

            editorRef.current.on('change', (instance, changes) => {
                const {origin} = changes;
                const code = instance.getValue();
                onCodeChange(code)
                if (origin !== 'setValue') {
                    socketRef.current.emit("code-change", {
                       roomId,
                       code,
                    })
                }
            })
        };
        init();
    }, []);

    useEffect(() => {
        if(socketRef.current){
            socketRef.current.on('code-change', ({code}) => {
                if(code !== null){
                    editorRef.current.setValue(code);
                }
            })
        }
        return () => {
            socketRef.current.off('code-change')
        }
    }, [socketRef.current])

  return (
    <div style={{height: "600px"}}>
        <textarea id='realTimeEditor'></textarea>
    </div>
  )
}

export default Editor
