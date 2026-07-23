import { activityRhythm } from '../utils/aggregations';

export default function CadenceBar({ tasks }) {
  const rhythm = activityRhythm(tasks, 14);
  const activeDays = rhythm.filter((d) => d.active).length;

  return (
    <div>
      <div className="cadence" aria-hidden="true">
        {rhythm.map((d) => (
          <div
            key={d.date}
            className={`cadence-bar${d.active ? ' active' : ''}`}
            style={{ height: `${10 + d.intensity * 7}px` }}
            title={`${d.label}: ${d.completed} completed`}
          />
        ))}
      </div>
      <div className="cadence-label">
        {activeDays} of the last 14 days had a task completed
      </div>
    </div>
  );
}
