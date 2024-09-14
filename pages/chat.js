import Chat from "@/components/chat";
// import SideBar from "@/components/sidebar";
import styles from "@/styles/home.module.scss";

export default function ChatPage() {
    return <div
    className={
      styles.container +
      ` ${styles["tight-container"]}`
    }
  ><>
    {/* <SideBar className={styles["sidebar-show"]} /> */}

    <div className={styles["window-content"]}>
        <Chat />
    </div>
    </>
    </div>;
}