import styles from "./model.module.scss";

export default function Model(props) {
    // props: {modelName, reasoning}
    return (
  <div class={styles["panel"]}>
    <div class={styles["ring2"]}>
      <div class={`${styles["card2"]} ${styles["card1"]}`}></div>
      <div class={styles["border"]}>
        <p class={styles["title"]}>Model: {props.model}</p>
        <div class={styles["slide"]}>
          <h6 class={styles["para"]}>{props.reasoning}</h6>
        </div>
      </div>
    </div>
  </div>
    );
}