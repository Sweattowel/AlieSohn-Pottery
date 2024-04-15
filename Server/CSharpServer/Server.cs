using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using MySql.Data.MySqlClient;
using System.Threading;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Mvc;
using DotNetEnv;
namespace Server
{
    public class Program
    {
        // ONSTARTUP CALLS
        public static void Main(string[] args)
        {
            try
            {
                DotNetEnv.Env.Load();
                Timer timer = new Timer(UpdateBrochure, null, TimeSpan.Zero, TimeSpan.FromMinutes(30));
                CreateHostBuilder(args).Build().Run();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred: {ex.Message}");
            }
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>()
                            .UseUrls(Environment.GetEnvironmentVariable("REACT_APP_SERVER_ADDRESS");
                });
        public static void UpdateBrochure(object state)
        {
            try
            {
                Console.WriteLine("Updating Brochure");
                DatabaseUtilities.CreateBrochure();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating brochure: {ex.Message}");
            }
        }
    }
    // DATABASE UTILITIES
    public class BrochureItem
    {
        public int ItemID { get; set; }
        public string ItemName { get; set; }
        public decimal ItemPrice { get; set; }
        public string ImagePath { get; set; }
        public int OrderCount { get; set; }
    }
    public static class BrochureStorage
    {
        public static List<BrochureItem> Brochure { get; set; }
    }
    public class ConnectionString
    {
        public static string GetConnectionString()
        {
            string userStr = Environment.GetEnvironmentVariable("REACT_APP_DATABASE_USER");
            string passStr = Environment.GetEnvironmentVariable("REACT_APP_DATABASE_PASSWORD");
            string hostStr = Environment.GetEnvironmentVariable("REACT_APP_DATABASE_HOST");
            string dataBaseStr = Environment.GetEnvironmentVariable("REACT_APP_DATABASE_DATABASE");
            return $"server={hostStr};user={userStr};database={dataBaseStr};port=3306;password={passStr};";
        }
    }

    public static class DatabaseUtilities
    {
        ////////////////// BROCHURE HANDLE    
        // BROCHURE CREATE
        public static void CreateBrochure()
        {
            try
            {
                List<BrochureItem> brochure = new List<BrochureItem>();
                string connectionString = ConnectionString.GetConnectionString();
                Console.WriteLine(connectionString);
                string queryStatement = "SELECT storeItems.itemID, storeItems.itemName, storeItems.imagePath, storeItems.itemPrice, COUNT(orders.orderID) AS order_count FROM storeItems JOIN orders ON storeItems.itemID = orders.itemID GROUP BY storeItems.itemID, storeItems.itemName ORDER BY order_count DESC LIMIT 3;";

                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    using (MySqlCommand command = new MySqlCommand(queryStatement, connection))
                    {
                        connection.Open();
                        MySqlDataReader reader = command.ExecuteReader();

                        while (reader.Read())
                        {
                            BrochureItem item = new BrochureItem
                            {
                                ItemID = reader.GetInt32(reader.GetOrdinal("itemID")),
                                ItemName = reader.GetString(reader.GetOrdinal("itemName")),
                                ItemPrice = reader.GetDecimal(reader.GetOrdinal("itemPrice")),
                                ImagePath = reader.GetString(reader.GetOrdinal("imagePath")),
                                OrderCount = reader.GetInt32(reader.GetOrdinal("order_count"))
                            };
                            brochure.Add(item);
                        }
                        reader.Close();
                    }
                }
                BrochureStorage.Brochure = brochure;
            }
            catch (MySqlException ex)
            {
                Console.WriteLine($"Database Error: {ex.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }
        }
    }
    // method for getting database variables

    public class Startup
    {
        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();
            services.AddCors(options =>
            {
                options.AddPolicy("AllowAll",
                    builder =>
                    {
                        builder.AllowAnyOrigin()
                               .AllowAnyMethod()
                               .AllowAnyHeader();
                    });
            });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseRouting();
            app.UseCors("AllowAll");
            app.UseAuthorization();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
namespace Server.Controllers
{
    //////// ROUTES
    // GET STOREITEMS
    [Route("/api/storeItems")]
    [ApiController]
    public class StoreItemsController : ControllerBase
    {
        public class StoreItem
        {
            public int ItemID { get; set; }
            public string ItemName { get; set; }
            public decimal ItemPrice { get; set; }
            public string ImagePath { get; set; }
            public string ItemDescription { get; set; }
        }
    [HttpGet]
        public ActionResult<IEnumerable<StoreItem>> GetStoreItems()
        {
            Console.WriteLine("Received Request for storeItems");
            string connectionString = ConnectionString.GetConnectionString();
            string queryStatement = "SELECT * FROM storeItems";
            List<StoreItem> storeItems = new List<StoreItem>();

            try
            {
                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    using (MySqlCommand command = new MySqlCommand(queryStatement, connection))
                    {
                        connection.Open();
                        MySqlDataReader reader = command.ExecuteReader();
                    
                        while (reader.Read())
                        {
                            StoreItem item = new StoreItem
                            {
                                ItemID = reader.GetInt32(reader.GetOrdinal("itemID")),
                                ItemName = reader.GetString(reader.GetOrdinal("itemName")),
                                ItemPrice = reader.GetDecimal(reader.GetOrdinal("itemPrice")),
                                ImagePath = reader.GetString(reader.GetOrdinal("imagePath")),
                                ItemDescription = reader.GetString(reader.GetOrdinal("itemDescription"))
                            };
                            storeItems.Add(item);
                        }
                        reader.Close();
                    }
                }
                return Ok(storeItems);
            }
            catch (MySqlException ex)
            {
                return StatusCode(500, $"Database Error: {ex.Message}");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }
    }
    
    // GET PREMADE BROCHURE
    [Route("/api/getBrochure")]
    [ApiController]
    public class GetBrochureController:  ControllerBase 
    {
        [HttpGet]
        public  ActionResult<IEnumerable<BrochureItem>> GetBrochure()
        {
            Console.WriteLine("Received Request for Brochure");
            string connectionString = ConnectionString.GetConnectionString();
            try
            {
                return Ok(BrochureStorage.Brochure);
            }
            catch (MySqlException ex)
            {
                return StatusCode(500, $"Database Error: {ex.Message}");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }
    }
}