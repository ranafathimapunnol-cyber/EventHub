export default function Loading() {
  return (
    <div className="loading-screen">
      <div className="loader">
        <div />
        <div />
        <div />
      </div>

      <p>Loading EventHub...</p>

      <style jsx>{`
        .loading-screen {
          min-height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 18px;
          color: #d8d0c4;
        }

        .loader {
          display: flex;
          gap: 8px;
        }

        .loader div {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #e9b872;
          animation: bounce 1s infinite alternate;
        }

        .loader div:nth-child(2) {
          animation-delay: 0.2s;
        }

        .loader div:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes bounce {
          from {
            transform: translateY(0);
            opacity: 0.4;
          }

          to {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
