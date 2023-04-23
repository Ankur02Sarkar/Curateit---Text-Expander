import "./todo.css";
import { AiOutlineEdit } from "react-icons/ai";
import { AiOutlineDelete } from "react-icons/ai";
export default function App() {
  return (
    <main id="todolist">
      <h1>
        Todo List
        <span>Get things done, one item at a time.</span>
      </h1>
      <ul>
        <li className="">
          <span className="label">Code a todo list</span>
          <div className="actions">
            <button
              type="button"
              aria-label="Done"
              title="Done"
              className="btn-picto"
            >
              <AiOutlineEdit size={27} />
            </button>
            <button
              type="button"
              aria-label="Delete"
              title="Delete"
              className="btn-picto"
            >
              <AiOutlineDelete size={27} />
            </button>
          </div>
        </li>
        <li className="">
          <span className="label">Learn something else</span>
          <div className="actions">
            <button
              type="button"
              aria-label="Done"
              title="Done"
              className="btn-picto"
            >
              <AiOutlineEdit size={27} />
            </button>
            <button
              type="button"
              aria-label="Delete"
              title="Delete"
              className="btn-picto"
            >
              <AiOutlineDelete size={27} />
            </button>
          </div>
        </li>
      </ul>
      <form name="newform">
        {/* <label for="newitem">Add to the list</label> */}
        <input type="text" name="text" id="text" />
        <input type="url" name="url" id="url" />
        <button type="submit">Add item</button>
      </form>
    </main>
  );
}
