import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.scss';


const div = document.getElementById('root') as HTMLDivElement;
const root = ReactDOM.createRoot(div);

const Pages = {
    '*': <App/>,
} as {[key: string]: React.ReactElement};

const url = new URL(window.location.href);
const Page = Pages[url.pathname] || Pages['*'];

root.render(Page);
