import { Fragment, useEffect, useRef, useState, useMemo } from "react";
import LoadingIcon from "../icons/three-dots.js";
import Image from "next/image";
import BottomIcon from "../icons/bottom.js";
import { IconButton } from "./button";
import SendWhiteIcon from "../icons/send-white.js";
import StopIcon from "../icons/pause.js";
import dynamic from "next/dynamic";
import styles from "./chat.module.scss";

export default function Chat() {

    const DEFAULT_TOPIC = "New Conversation";
    const CHAT_PAGE_SIZE = 15;
    const MAX_RENDER_MSG_COUNT = 45;

    const [session, setSession] = useState({
        id: "",
        topic: "",
        messages: [],
    });

    const [userInput, setUserInput] = useState("");
    const [hitBottom, setHitBottom] = useState(true);
    const [inputRows, setInputRows] = useState(2);

    const scrollRef = useRef();
    const inputRef = useRef();

    const isScrolledToBottom = scrollRef?.current
    ? Math.abs(
        scrollRef.current.scrollHeight -
          (scrollRef.current.scrollTop + scrollRef.current.clientHeight),
      ) <= 1
    : false;

    const { setAutoScroll, scrollDomToBottom } = useScrollToBottom(
        scrollRef,
        isScrolledToBottom,
      );
      const { shouldSubmit } = useSubmitHandler();

    const renderMessages = useMemo(() => {
        return session.messages.filter((m) => !m.hidden);
      }, [
        session.messages,
        session.messages.length,
        userInput,
      ]);

    const [msgRenderIndex, _setMsgRenderIndex] = useState(
        Math.max(0, renderMessages.length - CHAT_PAGE_SIZE),
      );
      function setMsgRenderIndex(newIndex) {
        newIndex = Math.min(renderMessages.length - CHAT_PAGE_SIZE, newIndex);
        newIndex = Math.max(0, newIndex);
        _setMsgRenderIndex(newIndex);
      }

      const messages = useMemo(() => {
        const endRenderIndex = Math.min(
          msgRenderIndex + 3 * CHAT_PAGE_SIZE,
          renderMessages.length,
        );
        return renderMessages.slice(msgRenderIndex, endRenderIndex);
      }, [msgRenderIndex, renderMessages]);

      const isStreaming = session.messages.some((m) => m.streaming);
    
      const onInput = (text) => {
        setUserInput(text);
        const n = text.trim().length;
      };

    const Markdown = dynamic(async () => (await import("./markdown")).Markdown, {
        loading: () => <LoadingIcon />,
    });

    function scrollToBottom() {
        setMsgRenderIndex(renderMessages.length - CHAT_PAGE_SIZE);
        scrollDomToBottom();
      }

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
        if (isStreaming) return;
    
        // TODO: send to backend
        setSession((prev) => {
            const newSession = { ...prev };
            const newMessage = {
                role: "user",
                content: userInput,
                date: new Date(),
            };
            newSession.messages.push(newMessage);
            return newSession;
            }
        );
        setUserInput("");
        setAutoScroll(true);
      };

    return (
        <div className={styles.chat} key={session.id}>
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
            ref={scrollRef}
            onScroll={(e) => onChatBodyScroll(e.currentTarget)}
            onMouseDown={() => inputRef.current?.blur()}
            onTouchStart={() => {
              inputRef.current?.blur();
              setAutoScroll(false);
            }}
          >
            {messages.map((message, i) => {
              const isUser = message.role === "user";
              const showActions =
                i > 0 &&
                !(message.preview || message.content.length === 0)
              const showTyping = message.preview || message.streaming;
        
              return (
                <Fragment key={`${i}/${message.id}`}>
                  <div
                    className={
                      isUser ? styles["chat-message-user"] : styles["chat-message"]
                    }
                  >
                    <div className={styles["chat-message-container"]}>
                      <div className={styles["chat-message-header"]}>
                        <div className={styles["chat-message-role-name-container"]}>
                          {message.role === "system" && (
                            <div
                              className={`${styles["chat-message-role-name"]} ${styles["no-hide"]}`}
                            >
                                {message.role}
                            </div>
                          )}
                          {message.role === "assistant" && (
                            <div className={styles["chat-message-role-name"]}>
                              {models.find((m) => m.name === message.model)
                                ? models.find((m) => m.name === message.model)?.display_name
                                : message.model}
                            </div>
                          )}
                        </div>
                      </div>
                      {showTyping && (
                        <div className={styles["chat-message-status"]}>
                          Typing...
                        </div>
                      )}
                      <div className={styles["chat-message-item"]}>
                        <Markdown
                          content={message.content}
                          loading={
                            (message.preview || message.streaming) &&
                            message.content.length === 0 &&
                            !isUser
                          }
                          fontSize={16}
                          parentRef={scrollRef}
                          defaultShow={i >= messages.length - 6}
                        />
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
          </div>
          <div className={styles["chat-input-panel"]}>
            <ScrollDownToast onclick={scrollToBottom} show={!hitBottom} />
    
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
                onFocus={scrollToBottom}
                onClick={scrollToBottom}
                rows={inputRows}
                autoFocus={true}
                style={{
                  fontSize: '1rem',
                }}
              />
              {isStreaming ? (
                <IconButton
                  icon={<StopIcon />}
                  text={"Stop"}
                  className={styles["chat-input-send"]}
                  type="primary"
                  onClick={() => onUserStop()}
                />
              ) : (
                <IconButton
                  icon={<SendWhiteIcon />}
                  text={"Send"}
                  className={styles["chat-input-send"]}
                  type="primary"
                  onClick={() => onSubmit(userInput)}
                />
              )}
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

  function useScrollToBottom(
    scrollRef,
    detach = false,
  ) {
    // for auto-scroll
  
    const [autoScroll, setAutoScroll] = useState(true);
    function scrollDomToBottom() {
      const dom = scrollRef.current;
      if (dom) {
        requestAnimationFrame(() => {
          setAutoScroll(true);
          dom.scrollTo(0, dom.scrollHeight);
        });
      }
    }
  
    // auto scroll
    useEffect(() => {
      if (autoScroll && !detach) {
        scrollDomToBottom();
      }
    });
  
    return {
      scrollRef,
      autoScroll,
      setAutoScroll,
      scrollDomToBottom,
    };
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