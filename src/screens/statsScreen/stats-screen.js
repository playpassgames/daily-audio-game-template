import state from "../../state";

const template = document.querySelector("#stats");

template.addEventListener("open", () => {
    template.querySelector("[name=stat-audio]").textContent = `${state.store.winStreak} : ${state.store.wins}`;
    template.querySelector("[name=stat-freeplay-score]").textContent = `${state.store.freePlayHighScore}`;
    template.querySelector("[name=stat-freeplay-streak]").textContent = `${state.store.freePlayHighStreak}`;
});
