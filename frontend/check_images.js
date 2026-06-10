fetch('http://localhost:5000/api/news/home')
  .then(res => res.json())
  .then(data => {
    let str = JSON.stringify(data);
    let urls = str.match(/https?:\/\/[^"]+\.(png|jpg|jpeg|webp|gif)/gi);
    console.log(urls ? urls.slice(0, 10) : 'No URLs found');
  })
  .catch(console.error);
