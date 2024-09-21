import React from 'react';
import './App.scss';


export default function App() {
    const link = "https://github.com/yoav28/React-Template";
    
    return <div className="App">
        <h1>
            This project was created with <a href={link} target="_blank">React Template.</a>
        </h1>
    </div>
}
