import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Home() {
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationEnabled, setNotificationEnabled] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  const fetchMeds = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/medications');
      setMeds(response.data);
    } catch (error) {
      console.error('Error fetching medications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeds();

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const getToday = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
  };

  const getMedId = (med) => med?._id || med?.id;

  const getMedTime = (med) => med?.timeOfDay || med?.time || '';

  const requestNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Your browser does not support notifications.');
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      setNotificationEnabled(true);
      new Notification('💊 Med Reminder', {
        body: 'Medication reminders are now enabled!'
      });
    }
  };

  const isTakenToday = (med) => med.takenDate === getToday();

  const markAsTaken = async (id) => {
    if (!id) {
      console.error('Action failed: Missing medication ID');
      return;
    }

    try {
      const response = await axios.patch(
        `http://localhost:5000/api/medications/${id}/taken`,
        { date: getToday() }
      );

      setMeds((prevMeds) =>
        prevMeds.map((med) => (getMedId(med) === id ? response.data : med))
      );
    } catch (error) {
      console.error('Error marking medication:', error.response?.data || error.message);
    }
  };

  const undoTaken = async (id) => {
    if (!id) return;

    try {
      const response = await axios.patch(
        `http://localhost:5000/api/medications/${id}/undo`
      );

      setMeds((prevMeds) =>
        prevMeds.map((med) => (getMedId(med) === id ? response.data : med))
      );
    } catch (error) {
      console.error('Error undoing medication:', error.response?.data || error.message);
    }
  };

  const deleteMedication = async (id) => {
    if (!id) return;

    const confirmDelete = window.confirm(
      'Are you sure you want to remove this medication?'
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/medications/${id}`);

      setMeds((prevMeds) => prevMeds.filter((med) => getMedId(med) !== id));
    } catch (error) {
      console.error('Error deleting medication:', error.response?.data || error.message);
    }
  };

  const convertToMinutes = (time) => {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  const formatTime = (time) => {
    if (!time) return 'Not set';

    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return time;

    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);

    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getMedicationStatus = (med) => {
    if (isTakenToday(med)) {
      return 'taken';
    }

    const timeStr = getMedTime(med);
    const medMinutes = convertToMinutes(timeStr);

    if (timeStr && currentMinutes > medMinutes) {
      return 'missed';
    }

    return 'upcoming';
  };

  useEffect(() => {
    if (!notificationEnabled) return;

    const checkReminders = () => {
      const now = new Date();
      const currentHour = String(now.getHours()).padStart(2, '0');
      const currentMinute = String(now.getMinutes()).padStart(2, '0');
      const currentTimeString = `${currentHour}:${currentMinute}`;
      const today = getToday();

      meds.forEach((med) => {
        const timeStr = getMedTime(med);
        const targetId = getMedId(med);

        if (timeStr === currentTimeString && med.takenDate !== today) {
          const notificationKey = `med-${targetId}-${today}`;

          if (!localStorage.getItem(notificationKey)) {
            new Notification('💊 Medication Reminder', {
              body: `Time to take ${med.name} (${med.dosage})`
            });

            localStorage.setItem(notificationKey, 'sent');
          }
        }
      });
    };

    checkReminders();
    const reminderInterval = setInterval(checkReminders, 15000);

    return () => clearInterval(reminderInterval);
  }, [meds, notificationEnabled]);

  const takenCount = meds.filter((med) => isTakenToday(med)).length;

  const progress =
    meds.length === 0 ? 0 : Math.round((takenCount / meds.length) * 100);

  const lowRefills = meds.filter((med) => med.refillCount <= 2);

  const filteredMeds = meds.filter((med) => {
    const matchesSearch = med.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const timeStr = getMedTime(med);
    const matchesFilter = filter === 'All' || filter === timeStr;

    return matchesSearch && matchesFilter;
  });

  const nextMedication = meds
    .filter(
      (med) =>
        !isTakenToday(med) && convertToMinutes(getMedTime(med)) >= currentMinutes
    )
    .sort(
      (a, b) =>
        convertToMinutes(getMedTime(a)) - convertToMinutes(getMedTime(b))
    )[0];

  const today = new Date();
  const dateText = today.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  if (loading) {
    return (
      <div className="page">
        <p>Loading medication schedule...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="dashboard-header">
        <div className="header-content">
          <span className="hospital-label">🏥 PERSONAL HEALTH DASHBOARD</span>
          <h1>Good day! 👋</h1>
          <p>Stay on track with your medication schedule.</p>
          <span className="dashboard-date">📅 {dateText}</span>
        </div>
      </div>

      <div className="notification-banner">
        <div>
          <strong>🔔 Medication Notifications</strong>
          <p>
            {notificationEnabled
              ? 'Reminders are currently enabled.'
              : 'Enable notifications so you never miss a dose.'}
          </p>
        </div>

        {!notificationEnabled && (
          <button
            className="notification-button"
            onClick={requestNotifications}
          >
            Enable Reminders
          </button>
        )}

        {notificationEnabled && (
          <span className="notification-active">● ON</span>
        )}
      </div>

      <div className="stats">
        <div className="stat-card">
          <div className="stat-icon">💊</div>
          <div>
            <div className="stat-number">{meds.length}</div>
            <div className="stat-label">Total Medications</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div>
            <div className="stat-number">{takenCount}</div>
            <div className="stat-label">Taken Today</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div>
            <div className="stat-number">{meds.length - takenCount}</div>
            <div className="stat-label">Remaining</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div>
            <div className="stat-number">{lowRefills.length}</div>
            <div className="stat-label">Low Refill</div>
          </div>
        </div>
      </div>

      {nextMedication && (
        <div className="next-medication">
          <div className="next-icon">⏰</div>
          <div className="next-info">
            <span>NEXT MEDICATION</span>
            <h2>{nextMedication.name}</h2>
            <p>{nextMedication.dosage}</p>
          </div>

          <div className="next-time">
            <strong>{formatTime(getMedTime(nextMedication))}</strong>
            <small>Scheduled time</small>
          </div>

          <button
            className="next-taken-button"
            onClick={(e) => {
              e.stopPropagation();
              markAsTaken(getMedId(nextMedication));
            }}
          >
            ✓ Mark as Taken
          </button>
        </div>
      )}

      <div className="progress-section">
        <div className="progress-header">
          <div>
            <h3>Today's Medication Progress</h3>
            <p>
              {takenCount} of {meds.length} medications completed
            </p>
          </div>
          <span>{progress}%</span>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {lowRefills.length > 0 && (
        <div className="warning-section">
          <div className="warning-icon">⚠️</div>
          <div>
            <strong>Low Refill Alert</strong>
            <p>
              {lowRefills.length} medication
              {lowRefills.length > 1 ? 's have' : ' has'} 2 or fewer refills
              remaining.
            </p>
          </div>
        </div>
      )}

      <div className="section-header">
        <div>
          <h2 className="section-title">Today's Medications</h2>
          <p className="section-subtitle">
            Manage your daily medication schedule.
          </p>
        </div>

        <Link to="/add" className="add-button">
          + Add Medication
        </Link>
      </div>

      <div className="controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search medication..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All Times</option>
          {[...new Set(meds.map((med) => getMedTime(med)))]
            .filter(Boolean)
            .map((time) => (
              <option key={time} value={time}>
                {formatTime(time)}
              </option>
            ))}
        </select>
      </div>

      {filteredMeds.length === 0 ? (
        <div className="empty-message">
          <div className="empty-icon">💊</div>
          <h3>
            {meds.length === 0
              ? 'No medications yet'
              : 'No medications found'}
          </h3>
          <p>
            {meds.length === 0
              ? 'Add your first medication to start your schedule.'
              : 'Try another search or filter.'}
          </p>
        </div>
      ) : (
        <div className="medication-list">
          {filteredMeds.map((med) => {
            const status = getMedicationStatus(med);
            const medId = getMedId(med);

            return (
              <div
                className={`medication-card ${status}`}
                key={medId}
              >
                <div className="medication-top">
                  <div className="medication-name">
                    <div className="medication-icon">💊</div>
                    <div>
                      <h3>{med.name}</h3>
                      <div className="dosage">{med.dosage}</div>
                    </div>
                  </div>

                  <div className={`status-badge ${status}`}>
                    {status === 'taken' && '✓ Taken'}
                    {status === 'missed' && '⚠ Missed'}
                    {status === 'upcoming' && '○ Upcoming'}
                  </div>
                </div>

                <div className="medication-details">
                  <div className="detail-box">
                    <div className="detail-label">TIME</div>
                    <div className="detail-value">
                      ⏰ {formatTime(getMedTime(med))}
                    </div>
                  </div>

                  <div className="detail-box">
                    <div className="detail-label">REFILL</div>
                    <div
                      className={
                        med.refillCount <= 2
                          ? 'detail-value refill-low'
                          : 'detail-value refill-good'
                      }
                    >
                      🔄 {med.refillCount} remaining
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  {status === 'taken' ? (
                    <button
                      className="undo-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        undoTaken(medId);
                      }}
                    >
                      ↩ Undo
                    </button>
                  ) : (
                    <button
                      className="taken-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsTaken(medId);
                      }}
                    >
                      ✓ Mark as Taken
                    </button>
                  )}

                  <button
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMedication(medId);
                    }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}