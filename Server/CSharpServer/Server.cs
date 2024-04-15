using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Mvc;

namespace Server
{
    public class Program
    {
        // ONSTARTUP CALLS
        public static void Main(string[] args)
        {
            Timer timer = new Timer(UpdateBrochure, null, TimeSpan.Zero, TimeSpan.FromMinutes(30));
            CreateHostBuilder(args).Build().Run();
            
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>()
                            .UseUrls("http://0.0.0.0:5000");
                });
    }
    // DATABASE UTILITIES
    public static class DatabaseUtilities
    {
        public static string GetConnectionString()
        {
            string userStr = Environment.GetEnvironmentVariable("REACT_APP_DATABASE_USER");
            string passStr = Environment.GetEnvironmentVariable("REACT_APP_DATABASE_PASSWORD");
            string hostStr = Environment.GetEnvironmentVariable("REACT_APP_DATABASE_HOST");
            string dataBaseStr = Environment.GetEnvironmentVariable("REACT_APP_DATABASE_DATABASE");
            return $"Server={hostStr};Database={dataBaseStr};User Id={userStr};Password={passStr};";
        }

            ////////////////// BROCHURE HANDLE    
    // BROCHURE DEFINTION 
    public static class BrochureStorage
    {
        public static List<BrochureItem> Brochure { get; set; }
    }
    public class BrochureItem
    {
        public int ItemID { get; set; }
        public string ItemName { get; set; }
        public decimal ItemPrice { get; set; }
        public string ImagePath { get; set; }
        public int OrderCount { get; set; }
    }
        // BROCHURE UPDATE CALL
        private static void UpdateBrochure(object state)
        {
            try
            {
                Console.WriteLine("Updating Brochure");
                CreateBrochure();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating brochure: {ex.Message}");
            }
        }
        // BROCHURE CREATE
        private static void CreateBrochure()
        {
            try
            {
                List<BrochureItem> brochure = new List<BrochureItem>();
                string connectionString = GetConnectionString();
                string queryStatement = "SELECT storeItems.itemID, storeItems.itemName, storeItems.imagePath, storeItems.itemPrice, COUNT(orders.orderID) AS order_count FROM storeItems JOIN orders ON storeItems.itemID = orders.itemID GROUP BY storeItems.itemID, storeItems.itemName ORDER BY order_count DESC LIMIT 3;";

                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    using (SqlCommand command = new SqlCommand(queryStatement, connection))
                    {
                        connection.Open();
                        SqlDataReader reader = command.ExecuteReader();

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
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating brochure: {ex.Message}");
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
            string connectionString = GetConnectionString();
            string queryStatement = "SELECT * FROM storeItems";
            List<StoreItem> storeItems = new List<StoreItem>();

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    using (SqlCommand command = new SqlCommand(queryStatement, connection))
                    {
                        connection.Open();
                        SqlDataReader reader = command.ExecuteReader();
                    
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
            catch (SqlException ex)
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
            string connectionString = GetConnectionString();
            try
            {
                return Ok(BrochureStorage.Brochure);
            }
            catch (SqlException ex)
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