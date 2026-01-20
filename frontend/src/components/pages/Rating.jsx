import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

function Rating({ value, text,style }) {
  return (
    // INLINE CSS: Flexbox to align stars horizontally
    <div style={{ display: 'flex', 
      alignItems: 'center', 
      justifyContent: style?.justifyContent || 'center',
      marginBottom: '10px' }}> 
      
      {[1, 2, 3, 4, 5].map((rate) => (
        <span key={rate} style={{ marginRight: '2px' }}> {/* INLINE CSS: Small gap between stars */}
          {value >= rate ? (
            <FaStar style={{ color: '#FFD700' }} />
          ) : value >= rate - 0.5 ? (
            <FaStarHalfAlt style={{ color: '#FFD700' }} />
          ) : (
            <FaRegStar style={{ color: '#FFD700' }} />
          )}
        </span>
      ))}

      {/* INLINE CSS: Style for the text (e.g., "12 reviews") */}
      <span style={{ marginLeft: '8px', fontWeight: 'bold', fontSize: '14px', color: '#0d7a25' }}>
        {text && text}
      </span>
      
    </div>
  );
}


export default Rating;