import React from "react";
import styles from "./ComingSoonPage.module.css";

const ComingSoonPage = ({ title, emoji, message = "Hastá aca llegué 😊" }) => {
    return (
        <div className={styles.comingSoon}>
            <h2>
                {emoji} {title}
            </h2>
            <p>{message}</p>
        </div>
    );
};

export default ComingSoonPage;
