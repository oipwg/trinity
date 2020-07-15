import React, {useEffect, useState} from 'react';


const ProgressBar = ({timestarted, duration, merchantStarted}) => {
    const hour = 3.6e+6
    const [progress, setProgress] = useState();
    const [loop, setLoop] = useState();

    const percentOfTimeElapsed = () => Number((((Date.now() - timestarted) / hour /duration) * 100).toFixed(2))

    useEffect(() => {
        if(progress >= 100){
            setProgress(100)
            return () => clearInterval(loop);
        }

        const interval = setInterval(() => {
            setProgress(percentOfTimeElapsed())
      }, 1000);

      setLoop(interval)

      return () => clearInterval(interval)

      }, [progress]);

    return (
        <div className="progress">
            <div style={{width:  `${progress}%`}} className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="15" aria-valuemin="0" aria-valuemax="100">{progress}%</div>
            <div style={{width: '0%'}} className="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" aria-valuenow="30" aria-valuemin="0" aria-valuemax="100">Trade</div>
        </div>
    )
}

export default ProgressBar