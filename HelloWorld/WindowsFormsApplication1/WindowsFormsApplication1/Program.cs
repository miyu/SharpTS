using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Windows.Forms;
using Newtonsoft.Json;

namespace WindowsFormsApplication1 {
   static class Program {
      private const string kToken = "76489ce35427c626d3f8f39ab82435fa";

      /// <summary>
      /// The main entry point for the application.
      /// </summary>
      [STAThread]
      static void Main() {
         var zipCodes = new[] {
            98296,98004,84728,89296,01011,62354,121052,24245,96862,91942,89908,32208,68803,22222,90210,17777
         };
         var things = zipCodes.Select(GetDataByZipCode).Where(x => x != null && x.Weather != null && x.Weather.Length > 0).GroupBy(x => x.Weather.First().Main).ToArray();
         var sb = new StringBuilder();
         sb.AppendLine("weather, city, country, lat, lon");
         foreach (var group in things) {
            foreach (var thing in group) {
               sb.AppendLine(
                  $"{thing.Weather.First().Main}, {thing.Name}, {thing.Sys.Country}, {thing.Coord.Lat}, {thing.Coord.Lon}"
               );
            }
         }
         Console.Clear();
         Console.WriteLine(sb);
         File.WriteAllText("derp.txt", sb.ToString());
      }

      private static Thing GetDataByZipCode(int zip) {
         try {
            string url = $"http://api.openweathermap.org/data/2.5/weather?zip={zip},us&appid={kToken}";
            var wc = new WebClient();
            var json = wc.DownloadString(url);
            Console.WriteLine(json);
            var thing = JsonConvert.DeserializeObject<Thing>(json);
            Console.WriteLine(thing.Name);
            return thing;
         } catch {
            return null;
         }
      }
   }

   public class Thing {
      public string Name { get; set; }
      public WeatherThing[] Weather { get; set; }
      public Coord Coord { get; set; }
      public Sys Sys { get; set; }
   }

   public class WeatherThing {
      public string Main { get; set; }
   }

   public class Coord {
      public float Lon { get; set; }
      public float Lat { get; set; }
   }

   public class Sys {
      public string Country { get; set; }
   }


// weather.main
   // name
   // syscountry
   // coord.lat coord.lon

   /*
   {  
   "coord":{  
      "lon":-122.08,
      "lat":37.39
   },
   "weather":[  
      {  
         "id":721,
         "main":"Haze",
         "description":"haze",
         "icon":"50d"
      }
   ],
   "base":"stations",
   "main":{  
      "temp":287.19,
      "pressure":1021,
      "humidity":51,
      "temp_min":285.15,
      "temp_max":289.35
   },
   "visibility":16093,
   "wind":{  
      "speed":2.6
   },
   "clouds":{  
      "all":5
   },
   "dt":1457467864,
   "sys":{  
      "type":1,
      "id":480,
      "message":0.0318,
      "country":"US",
      "sunrise":1457447250,
      "sunset":1457489425
   },
   "id":5375480,
   "name":"Mountain View",
   "cod":200
}

ABOUT

*/
}
