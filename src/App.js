import "./App.css";
import {
  useSession,
  useSupabaseClient,
  useSessionContext,
} from "@supabase/auth-helpers-react";
import DateTimePicker from "react-datetime-picker";
import { useState } from "react";

function App() {
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");

  const session = useSession(); // tokens, when session exists we have a user
  const supabase = useSupabaseClient(); // talk to supabase!
  const { isLoading } = useSessionContext();

  if (isLoading) {
    return <></>;
  }

  async function googleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: "https://www.googleapis.com/auth/calendar",
      },
    });
    if (error) {
      alert("Error logging in to Google provider with Supabase");
      console.log(error);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function createCalendarEvent() {
    console.log("Creating calendar event");
    const event = {
      summary: eventName,
      description: eventDescription,
      start: {
        dateTime: start.toISOString(), // Date.toISOString() ->
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // America/Los_Angeles
      },
      end: {
        dateTime: end.toISOString(), // Date.toISOString() ->
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // America/Los_Angeles
      },
    };
    await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + session.provider_token, // Access token for google
        },
        body: JSON.stringify(event),
      }
    )
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        console.log(data);
        alert("Event created, check your Google Calendar!");
      });
  }

  console.log(session);
  console.log(start);
  console.log(eventName);
  console.log(eventDescription);

  return (
    <div className="App">
      <div style={{ width: "400px", margin: "30px auto" }}>
        {session ? (
          <>
            <div class="card text-center">
              <div class="card-header">
                <h4>Hey there {session.user.email}</h4>
              </div>
              <div class="card-body">
                <h5 class="card-title">Start of your event</h5>
                <p class="card-text">
                  <DateTimePicker onChange={setStart} value={start} />
                </p>
              </div>
              <div class="card-body">
                <h5 class="card-title">End of your event</h5>
                <p class="card-text">
                  <DateTimePicker onChange={setEnd} value={end} />
                </p>
              </div>
              <div class="card-body">
                <h5 class="card-title">Event Name</h5>
                <p class="card-text">
                  <input
                    type="text"
                    onChange={(e) => setEventName(e.target.value)}
                  />
                </p>
              </div>
              <div class="card-body">
                <h5 class="card-title">Event description</h5>
                <p class="card-text">
                  <input
                    type="text"
                    onChange={(e) => setEventDescription(e.target.value)}
                  />
                </p>
              </div>
              <div class="card-body">
                <button
                  type="button"
                  class="btn btn-primary"
                  onClick={() => createCalendarEvent()}
                >
                  Create Calendar Event
                </button>
              </div>
              <div class="card-footer text-muted">
                <button
                  type="button"
                  class="btn btn-danger"
                  onClick={() => signOut()}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="container">
            <h1>Welcome to my React Calender App</h1>
            <br />
            <button
              onClick={() => googleSignIn()}
              type="button"
              class="btn btn-primary"
            >
              Connect with Google Calendar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
