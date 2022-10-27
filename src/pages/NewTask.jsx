import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";
import { url } from "../const";
import { Header } from "../components/Header";
import { useNavigate } from "react-router-dom";
import { format, setSeconds } from "date-fns";
import ja from "date-fns/locale/ja";
import ReactDatePicker, { registerLocale } from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import "./newTask.scss"

export const NewTask = () => {
  const [selectListId, setSelectListId] = useState();
  const [lists, setLists] = useState([]);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [endDate, setEndDate] = useState(
    setSeconds(new Date(),0)
  );
  const [limitDate, setLimitDate] = useState(format(endDate, "yyyy-MM-dd") + "T" + format(endDate, "hh:mm:ss") + "Z");
  const [errorMessage, setErrorMessage] = useState("");
  const [cookies] = useCookies();
  const navigate = useNavigate();
  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleDetailChange = (e) => setDetail(e.target.value);
  const handleSelectList = (id) => setSelectListId(id);
  const onCreateTask = () => {
    const data = {
      title: title,
      detail: detail,
      done: false,
      limit: limitDate
    }

    axios.post(`${url}/lists/${selectListId}/tasks`, data, {
        headers: {
          authorization: `Bearer ${cookies.token}`
        }
    })
    .then(() => {
      navigate("/");
    })
    .catch((err) => {
      setErrorMessage(`タスクの作成に失敗しました。${err}`);
    })
  }

  // 確認のために表示
  useEffect(() => {
    console.log(limitDate);
  }, [limitDate])

  // フォーマットに沿っていないデータをそのまま入れるのは危険なので一時的にlimitDateを通じてそれを直接axiosのリクエストデータに含めるようにする
  useEffect(() => {
    console.log(endDate.toISOString());
    setLimitDate(format(endDate, "yyyy-MM-dd") + "T" + format(endDate, "HH:mm:ss") + "Z");
  }, [endDate]);

  useEffect(() => {
    axios.get(`${url}/lists`, {
      headers: {
        authorization: `Bearer ${cookies.token}`
      }
    })
    .then((res) => {
      setLists(res.data)
      setSelectListId(res.data[0]?.id)
    })
    .catch((err) => {
      setErrorMessage(`リストの取得に失敗しました。${err}`);
    })
  }, [])

  return (
    <div>
      <Header />
      <main className="new-task">
        <h2>タスク新規作成</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="new-task-form">
          <label>リスト</label><br />
          <select onChange={(e) => handleSelectList(e.target.value)} className="new-task-select-list">
            {lists.map((list, key) => (
              <option key={key} className="list-item" value={list.id}>{list.title}</option>
            ))}
          </select><br />
          <label>タイトル</label><br />
          <input type="text" onChange={handleTitleChange} className="new-task-title" /><br />
          <label>詳細</label><br />
          <textarea type="text" onChange={handleDetailChange} className="new-task-detail" /><br />
          <p>期限</p>
          <ReactDatePicker
            className="date-picker"
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            showTimeSelect
            dateFormat={"yyyy-MM-dd HH:mm:ss"}
          />
          <div className="spacer"/>
          <button type="button" className="new-task-button" onClick={onCreateTask}>作成</button>
        </form>
      </main>
    </div>
  )
}