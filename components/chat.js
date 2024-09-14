import { Fragment, useEffect, useRef, useState, useMemo } from "react";
import LoadingIcon from "../icons/three-dots.js";
import Image from "next/image";
import BottomIcon from "../icons/bottom.js";
import { IconButton } from "./button";
import SendWhiteIcon from "../icons/send-white.js";
import StopIcon from "../icons/pause.js";
import dynamic from "next/dynamic";
import styles from "./chat.module.scss";
import ScrollContainer from "./ScrollContainer.js";

export default function Chat() {

    const DEFAULT_TOPIC = "New Conversation";

    const [loading, setLoading] = useState(false);

    const [session, setSession] = useState({
        id: "",
        topic: "",
    });

    const [messages, setMessages] = useState([]);

    const [userInput, setUserInput] = useState("");
    const [inputRows, setInputRows] = useState(2);

    const inputRef = useRef();
      const { shouldSubmit } = useSubmitHandler();
    
      const onInput = (text) => {
        setUserInput(text);
        const n = text.trim().length;
      };

    const Markdown = dynamic(async () => (await import("./markdown")).Markdown, {
        loading: () => <LoadingIcon />,
    });

    const onInputKeyDown = (e) => {
        // if ArrowUp and no userInput, fill with last input
        if (
          e.key === "ArrowUp" &&
          userInput.length <= 0 &&
          !(e.metaKey || e.altKey || e.ctrlKey)
        ) {
          setUserInput(localStorage.getItem(LAST_INPUT_KEY) ?? "");
          e.preventDefault();
          return;
        }
        if (shouldSubmit(e)) {
          onSubmit(userInput);
          e.preventDefault();
        }
      };

      const onSubmit = (userInput) => {
        if (userInput.trim() === "") return;    
        if (loading) return;

        setMessages([
            ...messages,
            {
                role: "user",
                content: userInput,
                date: new Date(),
            },
        ])

        sendMessage(userInput);

        setUserInput("");
        console.log(messages)
      };

    function sendMessage(message) {
      console.log("Sending message: ", message);
        setLoading(true);
        let loadingMessage = ""
        
          const es = new EventSource("http://127.0.0.1:5000/response");
          es.onmessage = (e) => {
            console.log(e.data);
            if (e.data == "Message 4") {
              console.log("Closing connection");
              es.close();
              setLoading(false);
            }

            else {
              loadingMessage += e.data;
                setMessages((prev) => {
                  if (prev.length > 0 && prev[prev.length - 1].role === "system") {
                    return [
                      ...prev.slice(0, prev.length - 1),
                      {
                        role: "system",
                        content: loadingMessage,
                        date: new Date(),
                        streaming: true,
                      },
                    ];
                  } else {
                    return [
                      ...prev,
                      {
                        role: "system",
                        content: loadingMessage,
                        date: new Date(),
                        streaming: true,
                      },
                    ];
                  }
                });
            }
          };

    }

    return (
        <div className={`${styles["chat"]}`} 
        key={session.id}>
          <div className="window-header">
            <div className={`window-header-title ${styles["chat-body-title"]}`}>
              <div
                className={`window-header-main-title ${styles["chat-body-main-title"]}`}
              >
                {!session.topic ? DEFAULT_TOPIC : session.topic}
              </div>
              <div className="window-header-sub-title">
                {session.id}
              </div>
            </div>
          </div>
    
          <div
            className={styles["chat-body"]}
          >
            <ScrollContainer >
            {messages.map((message, i) => {
              const isUser = message.role === "user";
        
              return (
                <Fragment key={`${i}/${message.id}`}>
                  <div
                    className={
                      isUser ? styles["chat-message-user"] : styles["chat-message"]
                    }
                  >
                    <div className={styles["chat-message-container"]}>
                      <div className={styles["chat-message-item"]}>
                        {message.role === "system" && (
                            <Markdown
                            content={message.content}
                            loading={
                              (message.preview || message.streaming) &&
                              message.content.length === 0 &&
                              !isUser
                            }
                            fontSize={16}
                          />
                        )}
                        {message.role === "user" && (
                            <div
                              fontSize={16}
                            >
                                {message.content}
                            </div>
                        )}
                      </div>
                      <div className={styles["chat-message-action-date"]}>
                        {message.role === "assistant" && message.usage && (
                          <>
                            <div>
                              {`Prefill: ${message.usage.extra.prefill_tokens_per_s.toFixed(
                                1,
                              )} tok/s,`}
                            </div>
                            <div>
                              {`Decode: ${message.usage.extra.decode_tokens_per_s.toFixed(
                                1,
                              )} tok/s,`}
                            </div>
                          </>
                        )}
                        <div>
                          {message.date.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </Fragment>
              );
            })}
            </ScrollContainer>
          </div>
          <div className={styles["chat-input-panel"]}>
    
            <label
              className={`${styles["chat-input-panel-inner"]}`}
              htmlFor="chat-input"
            >
              <textarea
                id="chat-input"
                ref={inputRef}
                className={styles["chat-input"]}
                placeholder={"Type a message..."}
                onInput={(e) => onInput(e.currentTarget.value)}
                value={userInput}
                onKeyDown={onInputKeyDown}
                rows={inputRows}
                autoFocus={true}
                style={{
                  fontSize: '1rem',
                }}
              />
              <IconButton
                  icon={<SendWhiteIcon />}
                  text={"Send"}
                  className={styles["chat-input-send"]}
                  type="primary"
                  onClick={() => onSubmit(userInput)}
                />
            </label>
          </div>
        </div>
      );
}

  export function ScrollDownToast(prop) {
    return (
      <div
        className={
          styles["toast-container"] + (prop.show ? ` ${styles["show"]}` : "")
        }
      >
        <div className={styles["toast-content"]} onClick={() => prop.onclick()}>
          <BottomIcon />
        </div>
      </div>
    );
  }

  function useSubmitHandler() {
    const isComposing = useRef(false);
  
    useEffect(() => {
      const onCompositionStart = () => {
        isComposing.current = true;
      };
      const onCompositionEnd = () => {
        isComposing.current = false;
      };
  
      window.addEventListener("compositionstart", onCompositionStart);
      window.addEventListener("compositionend", onCompositionEnd);
  
      return () => {
        window.removeEventListener("compositionstart", onCompositionStart);
        window.removeEventListener("compositionend", onCompositionEnd);
      };
    }, []);
  
    const shouldSubmit = (e) => {
      // Fix Chinese input method "Enter" on Safari
      if (e.keyCode == 229) return false;
      if (e.key !== "Enter") return false;
      if (e.key === "Enter" && (e.nativeEvent.isComposing || isComposing.current))
        return false;
      return (
        (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) === false &&
        !isComposing.current
      );
    };
  
    return {
      shouldSubmit,
    };
  }