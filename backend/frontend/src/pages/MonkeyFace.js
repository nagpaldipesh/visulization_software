import React from 'react';
import './MonkeyFace.css';

const MonkeyFace = ({ lookLeft, lookRight, coverEyes }) => {
  return (
    <div className="monkey-container">
      <div className={`monkey ${coverEyes ? 'cover-eyes' : ''}`}>
        <div className="ear left-ear"></div>
        <div className="ear right-ear"></div>

        <div className="face">
          <div className={`eye left-eye ${lookLeft ? 'look-left' : ''} ${lookRight ? 'look-right' : ''}`}></div>
          <div className={`eye right-eye ${lookLeft ? 'look-left' : ''} ${lookRight ? 'look-right' : ''}`}></div>
          <div className="nose"></div>
          <div className="mouth"></div>
        </div>

        <div className="hand left-hand"></div>
        <div className="hand right-hand"></div>
      </div>
    </div>
  );
};

export default MonkeyFace;
