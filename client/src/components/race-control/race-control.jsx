import React, {useState, useEffect, useRef} from "react";
import socket from "../../socket.js";
import log from "eslint-plugin-react/lib/util/log.js";

function formatTimer(milliseconds) {
    // todo maybe save as milliseconds so they can easily be compared and reformat after that to display
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const millisecondsRemainder = milliseconds % 1000;

    return milliseconds === undefined ? `01:00:00` : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${millisecondsRemainder.toString().padStart(2, '0')}`;
}

function RaceControl() {
    const [raceData, setRaceData] = useState([]); // Store all races and their drivers
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [raceStarted, setRaceStarted] = useState(false);
    //const [raceDataLength, setRaceDataLength] = useState(0);
    const [currentRaceIndex, setCurrentRaceIndex] = useState(-1);
    //const currentRaceIndex = useRef(0);
    const currentRace = raceData[currentRaceIndex] || {};

    useEffect(() => {
        // Request the latest race data and queue position from the server
        socket.emit("getRaceData");
        socket.emit("getQueuePosition");

        const handleRaceData = (data) => {
            setRaceData(data);

            // If the queuePosition is -1 and new races are added, set it to the first new race
            if (currentRaceIndex === -1 && data.length > 0) {
                const firstNewRaceIndex = 0; // Index of the first new race
                setCurrentRaceIndex(firstNewRaceIndex);
                socket.emit("updateQueuePosition", firstNewRaceIndex);
                log
            }
        };

        const handleRaceQueue = (queue) => {
            setCurrentRaceIndex(queue); // Synchronize with server
        };

        const handleTimerUpdate = (data) => {
            if (data.raceName === currentRace?.raceName) {
                setTimeRemaining(data.timeRemaining);
            }
        };

        socket.on("raceData", handleRaceData);
        socket.on("queuePosition", handleRaceQueue);
        socket.on("timerUpdate", handleTimerUpdate);

        return () => {
            socket.off("raceData", handleRaceData);
            socket.off("queuePosition", handleRaceQueue);
            socket.off("timerUpdate", handleTimerUpdate);
        };
    }, [currentRace?.raceName]);

    const startTimer = () => {
        socket.emit("startTimer", currentRace.raceName);
    };

    const pauseTimer = () => {
        socket.emit("pauseTimer", currentRace.raceName);
    };

    const resetTimer = () => {
        socket.emit("resetTimer", currentRace.raceName);
    };

    // Filter the drivers based on the selected race
    const driversToDisplay = currentRace?.drivers || [];

    //Handle Flag status buttons logic
    function handleRaceMode(event) {
        switch (event.target.value) {
            case "danger":
                console.log(raceData)
                pauseTimer();
                break;
            case "safe":
                startTimer();
                break;
            case "start":
                startTimer();
                socket.emit("updateRaceStatus", { raceName: currentRace.raceName, isOngoing: true, timeRemainingOngoingRace: timeRemaining, }); // Notify server
                setRaceStarted(true);
                break;
            case "hazard":
                console.log(raceData)
                break;
            case "finish":
                resetTimer();
                socket.emit("updateRaceStatus", { raceName: currentRace.raceName, isOngoing: false, }); // Notify server
                //console.log(currentRaceIndex);
                setRaceStarted(false);
                if (currentRaceIndex + 1 < raceData.length) {
                    const nextRaceIndex = currentRaceIndex + 1;
                    setCurrentRaceIndex(nextRaceIndex);
                    socket.emit("updateQueuePosition", nextRaceIndex);
                    //setRaceDataLength(raceData.length);
                    //setRaceData[0].queuePosition(10);
                } else {
                    setCurrentRaceIndex(-1);
                    socket.emit("updateQueuePosition", -1);
                }
                break;
            default:
                break;
        }
        socket.emit("flagButtonWasClicked", event.target.value);
    };


    return (
        <div style={{textAlign: "center"}}>
            <h1>Race Control Interface</h1>
            {raceStarted && (
                <div>
                    <h5>Time remaining:</h5>
                    <div className="countdown-timer-container">{formatTimer(timeRemaining)}</div>
                    <h2>Race controls:</h2>
                    <button onClick={handleRaceMode} value="safe">Safe</button>
                    <button onClick={handleRaceMode} value="danger">Danger!</button>
                    <button onClick={handleRaceMode} value="hazard">Hazardous!</button>
                    <button onClick={handleRaceMode} value="finish">Finish!</button>
                </div>)}
            {!raceStarted && (
                <>
                    {currentRace ? (
                        <h2>Next Race: {currentRace.raceName}</h2>
                    ) : (
                        <h2>No races in the queue</h2>
                    )}
            </>
    )}
            {currentRace && (
                <>
                    <ul>
                        {!raceStarted && currentRaceIndex !== -1 && (
                            <>
                            <button onClick={handleRaceMode} value="start">Start race</button>
                        <h2>Drivers List:</h2>
                        {driversToDisplay.map((driver, index) => (
                            <li key={index}>
                                {driver.name} - Car {driver.car}
                            </li>
                        ))}
                            </>
                    )}
                        {currentRaceIndex === -1 && (
                            <p>Next race has not been submitted</p>
                        )}
                    </ul>
                </>
            )}
        </div>
    );
}

export default RaceControl;
