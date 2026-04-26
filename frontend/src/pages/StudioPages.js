// src/pages/StudiosPage.js
import React from "react";
import { Link } from "react-router-dom";

// Static list of popular studios
const studios = [
  {
    id: 41077,
    name: "A24",
    logo: "https://media.themoviedb.org/t/p/h60/1ZXsGaFPgrgS6ZZGS37AqD5uU12.png",
  },
  {
    id: 420,
    name: "Marvel Studios",
    logo: "https://image.tmdb.org/t/p/w500/hUzeosd33nzE5MCNsZxCGEKTXaQ.png",
  },
  {
    id: 3,
    name: "Pixar",
    logo: "https://image.tmdb.org/t/p/w500/1TjvGVDMYsj6JBxOAkUHpPEwLf7.png",
  },
   {
    id: 923,
    name: "Legendary Pictures",
    logo: "https://media.themoviedb.org/t/p/h100_filter(negate,000,666)/5UQsZrfbfG2dYJbx8DxfoTr2Bvu.png",
  },
  
  {
    id: 10342,
    name: "Studio Ghibli",
    logo:"https://media.themoviedb.org/t/p/h100_filter(negate,000,666)/uFuxPEZRUcBTEiYIxjHJq62Vr77.png"
  },
   {
    id: 210099,
    name: "Amazon Studios",
    logo:"https://media.themoviedb.org/t/p/h100_filter(negate,000,666)/d6HwljzlOzxJ4tXlrpRkNZaZMWL.png"
  },
  {
    id: 1632,
    name: "Lionsgate",
    logo:"https://media.themoviedb.org/t/p/h100_filter(negate,000,666)/cisLn1YAUuptXVBa0xjq7ST9cH0.png"
  },
  {
    id: 34,
    name: "Sony Pictures",
    logo:"https://media.themoviedb.org/t/p/h100_filter(negate,000,666)/mtp1fvZbe4H991Ka1HOORl572VH.png"
  },
   {
    id: 127928,
    name: "20th Century Studios",
    logo:"https://media.themoviedb.org/t/p/h100_filter(negate,000,666)/h0rjX5vjW5r8yEnUBStFarjcLT4.png"
  },
  {
    id: 33,
    name: "Universal Pictures",
    logo:"https://media.themoviedb.org/t/p/h100_filter(negate,000,666)/3wwjVpkZtnog6lSKzWDjvw2Yi00.png"
  },
  {
    id: 44,
    name: "Cruise/Wagner Productions",
    logo:"https://media.themoviedb.org/t/p/h100_filter(negate,000,666)/6Hs6K20Hz1W9W1Tiam5QN2Kpx8V.png"
  },
   {
    id: 521,
    name: "DreamWorks",
    logo:"https://media.themoviedb.org/t/p/h100_filter(negate,000,666)/kP7t6RwGz2AvvTkvnI1uteEwHet.png"
  },
  {
    id: 174,
    name: "Warner Bros",
    logo:"https://media.themoviedb.org/t/p/h100_filter(negate,000,666)/zhD3hhtKB5qyv7ZeL4uLpNxgMVU.png"
  },
  {
    id: 4,
    name: "Paramount Pictures",
    logo:"https://media.themoviedb.org/t/p/h100_filter(negate,000,666)/gz66EfNoYPqHTYI4q9UEN4CbHRc.png"
  },
   {
    id: 5391,
    name: "Disney Toon Studios",
    logo:"https://media.themoviedb.org/t/p/h100_filter(negate,000,666)/o5AcK10ViutenSa4XTD18ClCEWe.png"
  },
  {
    id: 1,
    name: "Lucas Film",
    logo:"https://media.themoviedb.org/t/p/h100_filter(negate,000,666)/tlVSws0RvvtPBwViUyOFAO0vcQS.png"
  },
];

const StudiosPage = () => {
  return (
    <div className="p-4 min-h-screen mt-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {studios.map((studio) => (
          <Link
            to={`/company/${studio.id}`}
            key={studio.id}
            className="bg-gray-900 hover:bg-gray-800 p-4 rounded flex flex-col items-center transition"
          >
            <img
              src={studio.logo}
              alt={studio.name}
              className="h-16 object-contain mb-4"
            />
            <p className="text-white font-semibold">{studio.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default StudiosPage;
