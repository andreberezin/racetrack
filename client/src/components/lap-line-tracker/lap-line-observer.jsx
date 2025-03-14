import React, {useCallback, useEffect, useState} from 'react';
import './lap-line-observer.css';
import '../universal/universal.css';
import socket from '../../socket.js';
import {formatLapTime} from '../universal/formatLapTime.js';
import {fastestLapTime} from '../universal/calculateFastestLapTime.js';

function LapLineObserver() {
	const [raceDrivers, setRaceDrivers] = useState([]);
	const [raceMode, setRaceMode] = useState('');
	const [currentRaceName, setCurrentRaceName] = useState('');
	const [isDisabled, setIsDisabled] = useState('');
	const [currentLapTimes, setCurrentLapTimes] = useState({});

	// Handle incoming flag changes (race modes)
	useEffect(() => {
		socket.emit('getRaceMode');
		socket.emit('getAreAllRacesFinished');

		socket.on('raceMode', (newRacemode) => {
			setRaceMode(newRacemode);
			console.log('Getting race mode from the server');
		});
		socket.on('areAllRacesFinished', (data) => {
			console.log('AreAllRacesFinished value from server: ' + data);
		});

		// Clean up the socket listener on unmount
		return () => {
			socket.off('raceMode');
		};
	}, []);

	// use flag changes (race mode) to start and finish the race
	useEffect(() => {
		console.log('Race mode changed to: ' + raceMode);

		if (raceMode === 'finish') {
			setIsDisabled(true);
			console.log('The race has finished! Final results:');
			console.log(raceDrivers);
			stopStopwatch(raceDrivers);
		}

		if (raceMode === 'safe') {
			setIsDisabled(false);
			console.log('The race has started!');
		}

	}, [raceMode]);

	// Memoized function to handle incoming race data
	const handleRaceData = useCallback((raceData) => {
		const onGoingRace = raceData.filter((race) => race.isOngoing === true);
		if (onGoingRace[0]) {
			setCurrentRaceName(onGoingRace[0].raceName);
		} else {
			setCurrentRaceName('');
			console.error('No ongoing race exists');
			return;
		}

		if (onGoingRace.length > 0) {
			const updatedRaceDrivers = onGoingRace[0].drivers;

			// Compare and update `raceDrivers` only if it has changed
			setRaceDrivers((prev) => {
				if (JSON.stringify(prev) !== JSON.stringify(updatedRaceDrivers)) {
					return updatedRaceDrivers;
				}
				return prev; // No change, skip re-render
			});
		}

	}, []);

	// Fetch race data
	useEffect(() => {
		socket.emit('getRaceData');

		socket.on('raceData', (data) => {
			handleRaceData(data);
		});

		// Clean up the socket listener on unmount
		return () => {
			socket.off('raceData', handleRaceData);
		};
	}, []);

	// always get the latest stopwatch data form the server
	useEffect(() => {
		socket.emit('getCurrentLapTimesInRealTime');
		socket.on('currentLapTimesInRealTime', (lapTimes) => {
			if (lapTimes !== null) {
				setCurrentLapTimes(lapTimes);
			}
		});
		return () => {
			socket.off('currentLapTimesInRealTime');
		};
	}, [raceDrivers]);

	// emit the latest lap data when a driver finishes a lap
	useEffect(() => {
		console.log(raceDrivers);
		socket.emit('updateRaceDrivers', {raceName: currentRaceName, drivers: raceDrivers});
	}, [raceDrivers]);

	// functions to handle stopwatch logic through the server
	const startStopwatch = (driverName) => {
		socket.emit('startStopwatch', driverName);
	};

	const resetStopwatch = (driverName) => {
		socket.emit('resetStopwatch', driverName);
	};

	const stopStopwatch = (raceDrivers) => {
		socket.emit('stopStopwatch', raceDrivers);
	};

	const initializeStopwatch = (driverName) => {
		socket.emit('initializeStopwatch', driverName);
	};


	// Handle lap completion for a driver
	const driverCrossedFinishLine = (driverName) => {
		setRaceDrivers((prev) =>
			prev.map((driver) => {
				if (driver.name === driverName) {
					const newCurrentLap = driver.currentLap + 1;

					// Only update lapTimes, lapTimesMS, and fastestLap if currentLap > 0
					if (driver.currentLap > 0) {
						const newLapTimes = [
							...driver.lapTimes,
							formatLapTime(currentLapTimes[driverName] || 0)
						];
						const newLapTimesMS = [
							...driver.lapTimesMS,
							currentLapTimes[driverName] || 0
						];
						return {
							...driver,
							currentLap: newCurrentLap,
							lapTimes: newLapTimes,
							lapTimesMS: newLapTimesMS,
							fastestLap: formatLapTime(fastestLapTime(newLapTimesMS))
						};
					}
					// If it's the first lap (currentLap === 0), only increment the lap
					return {
						...driver,
						currentLap: newCurrentLap
					};
				}
				return driver;
			})
		);

		initializeStopwatch(driverName);
		resetStopwatch(driverName);
		startStopwatch(driverName);
	};

	return (
		<div className='LapLineObserver'>
			<div id='observerButtonsGrid'>
				{!currentRaceName ? (
					<>
						<p className='information'>No ongoing race exists</p>
					</>

				) : (
					raceDrivers.map((driver, index) => (
						<button
							id='observerButton'
							key={index}
							disabled={isDisabled}
							className={isDisabled ? 'blur' : ''}
							onClick={() => driverCrossedFinishLine(driver.name)}
						>
							{driver.car}
							<p className='stopwatch-container'>
                                <span className='stopwatch'>
                                    {formatLapTime(currentLapTimes[driver.name] || 0).minutes}
                                </span>
								:
								<span className='stopwatch'>
                                    {formatLapTime(currentLapTimes[driver.name] || 0).seconds}
                                </span>
								:
								<span className='stopwatch'>
                                    {formatLapTime(currentLapTimes[driver.name] || 0).milliseconds}
                                </span>
							</p>
						</button>
					))
				)}
				{currentRaceName && raceMode === 'finish' &&
					<p className='information session-ended'>Race session has ended</p>}
			</div>
		</div>
	);
}

export default LapLineObserver;
