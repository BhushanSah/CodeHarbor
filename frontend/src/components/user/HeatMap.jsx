import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./HeatMap.css";

const CELL_SIZE = 18;
const CELL_GAP = 5;
const DAY_LABEL_WIDTH = 42;
const DAY_LABEL_GAP = 10;
const MONTH_LABEL_OFFSET = DAY_LABEL_WIDTH + DAY_LABEL_GAP;

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const getStartDate = () => {
  const date = new Date();

  // Show around 6 months of activity.
  date.setMonth(date.getMonth() - 6);

  // Move back to Sunday so the grid starts cleanly.
  date.setDate(date.getDate() - date.getDay());

  date.setHours(0, 0, 0, 0);

  return date;
};

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getIntensity = (count) => {
  if (!count || count <= 0) return 0;
  if (count <= 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
};

const buildWeeks = (activityData, startDate) => {
  const activityMap = {};

  activityData.forEach((item) => {
    activityMap[item.date] = item.count || 0;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weeks = [];
  const currentDate = new Date(startDate);

  while (currentDate <= today) {
    const week = [];

    for (let day = 0; day < 7; day++) {
      const dateKey = formatDateKey(currentDate);
      const count = activityMap[dateKey] || 0;

      week.push({
        date: dateKey,
        count,
        intensity: getIntensity(count),
        dayOfMonth: currentDate.getDate(),
        month: currentDate.getMonth(),
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    weeks.push(week);
  }

  return weeks;
};

const buildMonthLabels = (weeks) => {
  const labels = [];
  const seenMonths = new Set();

  weeks.forEach((week, weekIndex) => {
    let labelDay = week.find((day) => day.dayOfMonth === 1);

    // Show the first visible month even if the range starts mid-month.
    if (!labelDay && weekIndex === 0) {
      labelDay = week[0];
    }

    if (!labelDay) return;

    const monthKey = labelDay.date.slice(0, 7);

    if (seenMonths.has(monthKey)) return;

    seenMonths.add(monthKey);

    labels.push({
      label: MONTH_LABELS[labelDay.month],
      column: weekIndex,
    });
  });

  return labels;
};

const HeatMapProfile = ({ userId }) => {
  const [activityData, setActivityData] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState("");

  const startDate = useMemo(() => getStartDate(), []);

  const weeks = useMemo(
    () => buildWeeks(activityData, startDate),
    [activityData, startDate]
  );

  const monthLabels = useMemo(() => buildMonthLabels(weeks), [weeks]);

  const totalActivity = activityData.reduce(
    (total, item) => total + (item.count || 0),
    0
  );

  useEffect(() => {
    const fetchActivityData = async () => {
      if (!userId) {
        setActivityLoading(false);
        return;
      }

      try {
        setActivityLoading(true);
        setActivityError("");

        const response = await axios.get(
          `http://localhost:3000/userActivity/${userId}`
        );

        setActivityData(response.data.activity || []);
      } catch (err) {
        console.error(
          "Could not load activity:",
          err.response?.status,
          err.response?.data || err.message
        );

        setActivityError(
          err.response?.data?.message ||
            "Could not load contribution activity."
        );
      } finally {
        setActivityLoading(false);
      }
    };

    fetchActivityData();
  }, [userId]);

  return (
    <section className="profile-heatmap-card">
      <div className="profile-heatmap-header">
        <div>
          <p className="profile-eyebrow">Activity</p>

          <h2>Contribution activity</h2>
        </div>

        <span>{totalActivity} contributions</span>
      </div>

      {activityLoading ? (
        <div className="profile-heatmap-state">
          <span className="spinner" aria-hidden="true" />
          Loading activity...
        </div>
      ) : activityError ? (
        <div className="profile-heatmap-state profile-heatmap-error">
          {activityError}
        </div>
      ) : (
        <>
          <div className="profile-heatmap-scroll">
            <div className="profile-heatmap">
              <div className="profile-heatmap-months">
                {monthLabels.map((month) => (
                  <span
                    key={`${month.label}-${month.column}`}
                    style={{
                      left: `${
                        MONTH_LABEL_OFFSET +
                        month.column * (CELL_SIZE + CELL_GAP)
                      }px`,
                    }}
                  >
                    {month.label}
                  </span>
                ))}
              </div>

              <div className="profile-heatmap-body">
                <div className="profile-heatmap-days">
                  <span>Sun</span>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                </div>

                <div className="profile-heatmap-grid">
                  {weeks.map((week, weekIndex) => (
                    <div className="profile-heatmap-week" key={weekIndex}>
                      {week.map((day) => (
                        <span
                          key={day.date}
                          className={`profile-heatmap-cell profile-heatmap-cell--${day.intensity}`}
                          title={`${day.count} contribution${
                            day.count === 1 ? "" : "s"
                          } on ${day.date}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="profile-heatmap-legend">
            <span>Less</span>

            <div className="profile-heatmap-legend-cells">
              <span className="heatmap-cell heatmap-cell--0" />
              <span className="heatmap-cell heatmap-cell--1" />
              <span className="heatmap-cell heatmap-cell--2" />
              <span className="heatmap-cell heatmap-cell--3" />
              <span className="heatmap-cell heatmap-cell--4" />
            </div>

            <span>More</span>
          </div>
        </>
      )}
    </section>
  );
};

export default HeatMapProfile;