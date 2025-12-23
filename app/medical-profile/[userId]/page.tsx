"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface MedicalProfile {
  user: any;
  personalDetails: any;
  emergencyContacts: any[];
  medicines: any[];
  doctors: any[];
}

export default function MedicalProfileSamplePage() {
  const { userId } = useParams();
  const [data, setData] = useState<MedicalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/medical-profile/${userId}`);
        if (!res.ok) {
          throw new Error("Profile not found");
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading medical profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  if (!data || !data.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        No profile data
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* USER INFO */}
      <section>
        <h1 className="text-2xl font-bold">{data.user.name}</h1>
        <p>Email: {data.user.email}</p>
        <p>Phone: {data.user.phone}</p>
      </section>

      {/* PERSONAL DETAILS */}
      <section>
        <h2 className="text-xl font-semibold">Personal Details</h2>
        <p>Date of Birth: {data.personalDetails?.dateOfBirth || "-"}</p>
        <p>Blood Type: {data.personalDetails?.bloodType || "-"}</p>
        <p>Height: {data.personalDetails?.height || "-"}</p>
        <p>Weight: {data.personalDetails?.weight || "-"}</p>
      </section>

      {/* EMERGENCY CONTACTS */}
      <section>
        <h2 className="text-xl font-semibold">Emergency Contacts</h2>
        {data.emergencyContacts.length === 0 ? (
          <p>No emergency contacts</p>
        ) : (
          <ul className="list-disc ml-5">
            {data.emergencyContacts.map((c) => (
              <li key={c.id}>
                {c.name} ({c.relationship}) — {c.phone}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* MEDICINES */}
      <section>
        <h2 className="text-xl font-semibold">Medicines</h2>
        {data.medicines.length === 0 ? (
          <p>No medicines</p>
        ) : (
          <ul className="list-disc ml-5">
            {data.medicines.map((m) => (
              <li key={m.id}>
                {m.name} — {m.dosage} ({m.frequency})
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* DOCTORS */}
      <section>
        <h2 className="text-xl font-semibold">Doctors</h2>
        {data.doctors.length === 0 ? (
          <p>No doctors listed</p>
        ) : (
          <ul className="list-disc ml-5">
            {data.doctors.map((d) => (
              <li key={d.id}>
                {d.name} — {d.specialty} — {d.phone}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
