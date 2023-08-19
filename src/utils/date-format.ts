export function getFormattedDate(timestampString: string | Date): String {
  const today = new Date(timestampString);
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  const formattedToday = `${year}-${month}-${day}`;
  return formattedToday;
}
