import React, { useState } from "react";

interface Props
{
    onConfirm: () => void;
    onCancel: () => void;
}

const CardHandle: React.FC<Props> = ({ onConfirm, onCancel }) =>
{
    const [termAgreement, setTermAgreement] = useState<boolean>(false);
    const [cardNumber, setCardNumber] = useState<string>("");
    const [expirationDate, setExpirationDate] = useState<string>("");
    const [cvv, setCvv] = useState<string>("");
    const [message, setMessage] = useState<string>("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) =>
    {
        e.preventDefault();

        // Mocking the transaction process
        if (cardNumber && expirationDate && cvv) {
            // Simulate transaction success
            setMessage("Transaction successful!");
            onConfirm()
        } else {
            setMessage("Please fill in all the fields.");
        }
    };

    return (
        <div className="bg-WHITE h-[50%] text-WHITE fixed w-[30%] border border-BLACK">
            {termAgreement ? (
                <div className="text-BLACK text-center ">
                    <h2 className="bg-BACKGROUND font-serif text-[1.3rem] mb-2 text-WHITE">FAKE Transaction</h2>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="cardNumber">Card Number:</label>
                            <br />
                            <input
                                className="border border-BLACK rounded"
                                type="text"
                                id="cardNumber"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                placeholder="Enter FALSE card number"
                            />
                        </div>
                        <div>
                            <label htmlFor="expirationDate">Expiration Date:</label>
                            <br />
                            <input
                                className="border border-BLACK rounded"
                                type="text"
                                id="expirationDate"
                                value={expirationDate}
                                onChange={(e) => setExpirationDate(e.target.value)}
                                placeholder="FALSE MM/YY"
                            />
                        </div>
                        <div>
                            <label htmlFor="cvv">CVV:</label>
                            <br />
                            <input
                                className="border border-BLACK rounded"
                                type="text"
                                id="cvv"
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value)}
                                placeholder="Enter FALSE CVV"
                            />
                        </div>
                        <button
                            className="bg-WHITE border border-black rounded shadow-lg w-40 mt-4"
                            onClick={() => handleSubmit}
                        >
                            Submit
                        </button>
                        <button onClick={onCancel} className="bg-WHITE border border-black rounded shadow-lg w-40 mt-4">
                            CANCEL
                        </button>
                    </form>
                    {message && <p>{message}</p>}
                    <button onClick={() => setTermAgreement(false)} className="text-center border border-BLACK w-40 rounded shadow-lg mt-20">I DISAGREE</button>
                </div>
            ) : (
                <div className="bg-WHITE h-[50%] text-WHITE fixed w-[30%] border border-BLACK">
                    <h1 className="bg-BACKGROUND text-center text-[1.5rem] border-b border-WHITE">
                        AGREEMENT
                    </h1>
                    <div className="text-BLACK flex text-center justify-center items-center mb-20">
                        By continuing you acknowledge that this is not a real transaction, that should you enter any data in here, you agree that there has been adequate warning TO NOT enter any sensitive info and that any harm occured is your responsibility
                    </div>
                    <button onClick={() => setTermAgreement(true)} className="bg-BACKGROUND m-auto flex justify-center text-center border border-BLACK w-40 rounded shadow-lg">I AGREE</button>
                </div>
            )}

        </div>
    );
}

export default CardHandle;
