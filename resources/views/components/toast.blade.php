<!-- This container holds toast element -->
<div id="toast-container"></div>
<style>
    /* Custom Toast styling  */
    #toast-container {
        position: fixed;
        top: 5px;
        left: 50%;
        z-index: 9999;
        display: flex;
        align-items: center;
        flex-direction: column;
        gap: 10px;
        transform: translateX(-50%);
    }

    .toast {
        padding: 20px;
        min-width: 250px;
        border-radius: 8px;
        box-shadow: 5px 5px 15px 0px rgba(0, 0, 0, 15);
        animation: slideIn 0.5s ease-out forwards;
        font-weight: 500;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    /* Toast Animations */
    @keyframes slideIn {
        from {
            transform: translateY(0);
            opacity: 0;
        }

        to {
            transform: translateY(25%);
            opacity: 1;
        }
    }

    .toast-success {
        background-color: #2ecc71;
        color: white;
        border-left: 5px solid #27ae60;
    }

    .toast-error {
        background-color: #e74c3c;
        color: white;
        border-left: 5px solid #c0392b;
    }

    .toast.hide {
        animation: slideOut 0.5s ease-in forwards;
    }

    @keyframes slideOut {
        from {
            transform: translateY(-20);
            opacity: 1;
        }

        to {
            transform: translateY(0);
            opacity: 0;
        }
    }

    @media (max-width: 768px) {
        #toast-container {
            font-size: 0.85rem;
            top: 2vh;
            left: 50%;
            transform: translateX(-50%);
            width: 60%;
            right: auto;
        }

        .toast {
            min-width: 1vw;
            width: 100%;
            max-width: 350px;
            margin: 0 auto;
        }

        @keyframes slideIn {
            from {
                transform: translateY(-20px);
                opacity: 0;
            }

            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
    }
</style>