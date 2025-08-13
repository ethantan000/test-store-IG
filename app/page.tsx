import FadeInSection from '../components/FadeInSection';

export default function Home() {
  return (
    <main className="space-y-24 p-8">
      {[1, 2, 3].map((i) => (
        <FadeInSection key={i}>
          <div className="h-48 rounded-lg bg-gray-800 p-4 text-white">Section {i}</div>
        </FadeInSection>
      ))}
    </main>
  );
}
