import { useState } from 'react';
import logo from './assets/logo.svg';
import './App.css';
import api from './api';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface IBaseMessage {
  content: string;
  timestamp: string;
  showPostMessages: boolean;
  postMessages: {
    content: string;
    timestamp: string;
  }[];
};

interface IAnswer {
  content: string;
  baseMessages: IBaseMessage[];
};

const formatToBrazilianDate = (isoDateString: string) => {
  const date = new Date(isoDateString);
  date.setHours(date.getHours() + 3);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Os meses são baseados em zero
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  console.log("date", `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`)
  return `${day}/${month}/${year} às ${hours}:${minutes}`;
};

function App() {
  const [answer, setAnswer] = useState<IAnswer | undefined>(undefined);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleQuestion = async () => {
    setLoading(true);
    try {
      const response = await api.post("/chat", {
        input: question
      });
      console.log(response);
      setAnswer(response.data);
    } catch(error) {
      console.error("Erro:", error);
    };
    setLoading(false);
  };

  const handleQuestionAgain = () => {
    setAnswer(undefined);
    setQuestion("");
  };

  return (
    <>
      <div className="titleContainer">
        <img src={logo} className="logo" alt="UFRJ logo" />
        <h1 className="title">Hub de Dúvidas<br />Eng. de Computação e Informação</h1>
      </div>
      {answer ?
        <div className="card">
          <p><strong>Pergunta:</strong> {question}</p>
          <div>
            <p><strong>Resposta:</strong></p>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
            >
              {answer.content}
            </ReactMarkdown>
          </div>
          <button className="askButton" onClick={handleQuestionAgain}>
            Perguntar novamente
          </button>
          <div className="baseMessagesContainer">
            <p><strong>Mensagens base para a resposta:</strong></p>
            <ul>
              {answer.baseMessages.map((baseMessage, baseMessageIndex) => {
                return (
                  <li key={baseMessageIndex}>
                    <div className="baseMessageContainer">
                      <span><strong>{`[Data do envio: ${formatToBrazilianDate(baseMessage.timestamp)}]`}</strong></span> 
                      <span>{baseMessage.content}</span>
                      <button 
                        className="showPostMessagesButton" 
                        onClick={() => setAnswer({
                          ...answer,
                          baseMessages: answer.baseMessages.map((e, i) => {
                            if (i !== baseMessageIndex) {
                              return e;
                            } else {
                              return {
                                ...e,
                                showPostMessages: !e.showPostMessages
                              }
                            }
                          })
                        })}
                      >
                        {`${baseMessage.showPostMessages ? "Fechar" : "Mostrar"} mensagens posteriores`}
                      </button>
                    </div>
                    {baseMessage.showPostMessages && 
                    <ul>
                      {baseMessage.postMessages.map((postMessage, postIndex) => (
                        <li key={postIndex}>{postMessage.content}</li>
                      ))}
                    </ul>}
                  </li>
              )})}
            </ul>
          </div>
        </div>
        :
        <div className="card">
        <textarea 
          className="questionInput"
          placeholder="Faça uma pergunta..." 
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button 
          className="askButton" 
          onClick={handleQuestion}
          disabled={loading || !question}
        >
          {loading ? "Carregando..." : "Perguntar"}
        </button>
      </div>}
    </>
  );
};

export default App;
