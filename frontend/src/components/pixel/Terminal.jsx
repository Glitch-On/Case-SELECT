import { API_BASE_URL } from "../../api/client.js";
import { Modal } from "./Modal.jsx";

/**
 * In-game SQL terminal.
 *
 * This is a presentation wrapper only: it embeds the backend's existing SQL IDE
 * page in an iframe so players get the real editor, schema explorer and terminal
 * commands. No SQL engine, parser or execution logic lives here.
 */
export function Terminal({ isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="DETECTIVE'S TERMINAL"
      wide
      flushBody
    >
      <iframe
        className="terminal-frame"
        src={`${API_BASE_URL}/`}
        title="SQL IDE — detective's terminal"
      />
    </Modal>
  );
}
