export default (dateString) => {
  const dateInstance = new Date(dateString);
  const year = dateInstance.getFullYear();
  const month = dateInstance.getMonth();
  const date = dateInstance.getDate();
  const hours = dateInstance.getHours();
  const minutes = dateInstance.getMinutes();

  const currentDate = new Date(Date.now());

  const diff = currentDate.getTime() - dateInstance.getTime();

  const diffHrs = diff / (1000 * 60 * 60);

  if (diffHrs < 24) {
    return `Today at ${hours}:${minutes}`;
  } else if (currentDate.getFullYear() !== year) {
    return `${date}/${month}/${year} at ${hours}:${minutes}`;
  } else return `${date}/${month} at ${hours}:${minutes}`;
};
