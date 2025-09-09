"use client";

import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";
import { CuacaProps } from "../../types";

const AnalisisCuacaCarausel = () => {
  const [cuacaDalam3Hari, setCuacaDalam3Hari] = useState<CuacaProps | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=16.71.15.1001"
        );
        const data: CuacaProps = await res.json();
        setCuacaDalam3Hari(data);
      } catch (err) {
        console.error("Gagal fetch cuaca:", err);
      }
    };

    fetchData();
  }, []);

  const now = new Date();

  // fungsi parse manual agar tidak salah timezone
  const parseLocalDatetime = (localDatetime: string) => {
    const [datePart, timePart] = localDatetime.split(" ");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute, second] = timePart.split(":").map(Number);
    return new Date(year, month - 1, day, hour, minute, second);
  };

  // helper cek apakah item ini "Sekarang"
  const isNowTime = (
    localDatetime: string,
    nextDatetime: string | null,
    now: Date
  ) => {
    const start = parseLocalDatetime(localDatetime);
    const end = nextDatetime ? parseLocalDatetime(nextDatetime) : null;

    if (end) {
      return now >= start && now < end; // dalam interval slot
    } else {
      return now >= start; // kalau slot terakhir
    }
  };

  if (!cuacaDalam3Hari) {
    return <div>Loading data cuaca...</div>;
  }

  return (
    <div className="w-full h-[820px]">
      <h1>{cuacaDalam3Hari.data[0].cuaca[0][0].local_datetime}</h1>
      <Carousel className="w-full">
        <CarouselContent>
          {cuacaDalam3Hari.data[0].cuaca.map((hari, hariIndex) => (
            <CarouselItem key={hariIndex}>
              <div className="p-6 rounded-2xl shadow">
                <div className="grid grid-rows-1 gap-1">
                  {hari &&
                    hari.map((item, index) => {
                      const timeStr = item.local_datetime
                        .split(" ")[1]
                        .slice(0, 5);
                      const nextItem = hari[index + 1] || null;

                      return (
                        <div
                          className="grid grid-cols-4 my-2 w-full items-center"
                          key={index}
                        >
                          <h5>
                            {isNowTime(
                              item.local_datetime,
                              nextItem?.local_datetime || null,
                              now
                            )
                              ? "Sekarang"
                              : timeStr}
                          </h5>
                          <h5>{item.t}°</h5>
                          <h5>{item.weather_desc}</h5>
                          <Image
                            src={item.image}
                            alt={item.weather_desc}
                            width={35}
                            height={35}
                            className="mx-auto"
                          />
                        </div>
                      );
                    })}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default AnalisisCuacaCarausel;
