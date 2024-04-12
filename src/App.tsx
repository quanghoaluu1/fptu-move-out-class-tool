export default function App() {
  const subjects = ["DBI202", "CSD203", "LAB211", "JPD113", "WED201c"];
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const slots = [1, 2, 3, 4, 5, 6, 7, 8];
  const object = new Map(weekdays);
  return (
    <div>
      <div>
        {subjects.map((item) => (
          <button>{item}</button>
        ))}
      </div>
      <table>
        <thead>
          <tr>
            <td></td>
            {weekdays.map((day) => (
              <td>{day}</td>
            ))}
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => {
            return (
              <tr>
                <td>Slot {slot}</td>
                {weekdays.map((day) => (
                  <td>{day}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
