import React, { useState } from 'react';
import './SaveQueryModal.css';

interface SaveQueryModalProps {
  query: string;
  onSave: (name: string) => void;
  onClose: () => void;
  message?: string;
}

const SaveQueryModal: React.FC<SaveQueryModalProps> = ({ query, onSave, onClose, message }) => {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Save Query</h3>
        <p><strong>Query:</strong> {query}</p>
        <input
          type="text"
          placeholder="Enter name for the query"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="modal-actions">
          <button onClick={handleSubmit}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
        {message && <p className="save-message">{message}</p>}
      </div>
    </div>
  );
};

export default SaveQueryModal;
