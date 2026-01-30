import Swal from 'sweetalert2';

export const showAlert = (message) => {
  Swal.fire({
    // Using HTML to recreate your text logo style
    html: `
      <div style="
        font-family: 'Quicksand', sans-serif; 
        font-size: 28px;
        font-weight: 700;  
        color: #77199c; 
        margin-bottom: 10px;
        letter-spacing: 2px;
        text-shadow: 3px 3px 0px #dbcdfd;">
        LULLABY
      </div>
      <div style="font-size: 16px; color: #555;">${message}</div>
    `,
    showConfirmButton: true,
    confirmButtonColor: '#111', // Matches your black 'Add to Cart' button
    confirmButtonText: 'OK',
    borderRadius: '15px',
    padding: '2rem',
  });
};