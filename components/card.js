import styles from "./card.module.scss";

export default function Card(props) {
    // props: {agentName, llmType, autoReply}
    return (
  <div class={styles["panel"]}>
    <div class={styles["ring"]}>
      <div class={`${styles["card"]} ${styles["card1"]}`}></div>
      <div class={styles["border"]}>
        <p class={styles["title"]}>{props.text}</p>
      </div>
    </div>
  </div>
    );
}