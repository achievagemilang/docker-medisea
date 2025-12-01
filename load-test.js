import { check, sleep } from "k6";
import http from "k6/http";

export const options = {
  scenarios: {
    constant_rps: {
      executor: "constant-arrival-rate",
      rate: 50, // target iterations per second (approx RPS)
      timeUnit: "1s",
      duration: "45s",
      preAllocatedVUs: 80, // pool size to sustain the RPS
      maxVUs: 120,
    },
  },
};

export default function () {
  const loginRes = http.post(
    "http://10.134.134.69/api/v1/auth/login",
    JSON.stringify({
      email: "user@medisea.com",
      password: "passpass",
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  check(loginRes, { "login successful": (r) => r.status === 200 });

  const token = loginRes.json("data")?.access_token;
  const profileRes = http.get("http://localhost:8080/api/v1/users/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });

  check(profileRes, { "profile ok": (r) => r.status === 200 });
  sleep(1);

  console.log("login status", loginRes.status, loginRes.body);
  console.log("profile status", profileRes.status, profileRes.body);
}
