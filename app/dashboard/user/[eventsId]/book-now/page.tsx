import BookEventClient from "./BookEvent";

export default async function Page({
  params,
}: {
  params: Promise<{ eventsId: string }>;
}) {
  const { eventsId } = await params; // ✅ unwrap Promise

  return <BookEventClient eventId={eventsId} />;
}
