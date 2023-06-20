import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Dropzone from 'react-dropzone';

import './App.css';

const localizer = momentLocalizer(moment);

const App = () => {
  const [events, setEvents] = useState([]);
  const [fileContent, setFileContent] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  useEffect(() => {
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }
  }, []);

  useEffect(() => {
    fetchAdminCredentials();
  }, []);

  const fetchAdminCredentials = async () => {
    try {
      const response = await fetch('/admin.json');
      const data = await response.json();
      setAdminCredentials(data);
    } catch (error) {
      console.error('Failed to fetch admin credentials:', error);
    }
  };

  const handleSelect = ({ start, end }) => {
    if (!isAdmin) return;

    const title = window.prompt('Enter event title:');
    if (title) {
      const newEvent = {
        id: events.length + 1,
        title,
        start,
        end,
      };
      setEvents([...events, newEvent]);
    }
  };

  const handleEdit = (event) => {
    if (!isAdmin) return;

    const title = window.prompt('Enter updated event title:', event.title);
    if (title) {
      const updatedEvent = { ...event, title };
      const updatedEvents = events.map((ev) =>
        ev.id === updatedEvent.id ? updatedEvent : ev
      );
      setEvents(updatedEvents);
    }
  };

  const handleFileDrop = (acceptedFiles) => {
    if (!isAdmin) return;

    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setFileContent(content);
    };
    reader.readAsText(file);
  };

  const handleLoadEvents = () => {
    if (!isAdmin) return;

    if (!validateAdminCredentials()) {
      alert('Invalid admin credentials. Please try again.');
      setUsernameInput('');
      setPasswordInput('');
      return;
    }

    try {
      const parsedEvents = JSON.parse(fileContent);
      setEvents(parsedEvents);
      localStorage.setItem('events', JSON.stringify(parsedEvents));
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const validateAdminCredentials = () => {
    return (
      adminCredentials &&
      usernameInput === adminCredentials.username &&
      passwordInput === adminCredentials.password
    );
  };

  const handleChangePassword = () => {
    if (!isAdmin) return;

    if (!validateAdminCredentials()) {
      alert('Invalid admin credentials. Please try again.');
      setUsernameInput('');
      setPasswordInput('');
      return;
    }

    const newPassword = window.prompt('Enter new admin password:');
    if (newPassword) {
      const newAdminCredentials = { ...adminCredentials, password: newPassword };
      setAdminCredentials(newAdminCredentials);
      alert('Password changed successfully!');
    }
  };

  return (
    <div className="App">
      <div className="banner">
        <img src="/sandata-banner.jpg" alt="Sandata Technologies Banner" />
      </div>
      <h1>Event Calendar</h1>
      {isAdmin && (
        <>
          <Dropzone onDrop={handleFileDrop} accept=".txt" multiple={false}>
            {({ getRootProps, getInputProps }) => (
              <div className="dropzone" {...getRootProps()}>
                <input {...getInputProps()} />
                <p>Drag and drop events file here, or click to browse</p>
              </div>
            )}
          </Dropzone>
          <div className="password-section">
            <input
              type="text"
              placeholder="Admin username"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
            />
            <input
              type="password"
              placeholder="Admin password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
            <button onClick={handleLoadEvents} disabled={!fileContent}>
              Load Events
            </button>
            <button onClick={handleChangePassword}>Change Password</button>
          </div>
        </>
      )}
      <div className="calendar-container">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={['month', 'week', 'day']}
          defaultView="month"
          selectable={isAdmin}
          onSelectSlot={handleSelect}
          onSelectEvent={handleEdit}
          style={{ height: '100%', width: '100%' }}
        />
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={() => setIsAdmin(!isAdmin)}
          />
          Admin Mode
        </label>
      </div>
    </div>
  );
};

export default App;
