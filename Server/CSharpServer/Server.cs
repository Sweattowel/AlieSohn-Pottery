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
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }

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

    namespace Server.Controllers
    {
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
                catch (Exception ex)
                {
                    return BadRequest("Error: " + ex.Message);
                }
            }

            private string GetConnectionString()
            {
                string userStr = Environment.GetEnvironmentVariable("REACT_APP_DATABASE_USER");
                string passStr = Environment.GetEnvironmentVariable("REACT_APP_DATABASE_PASSWORD");
                string hostStr = Environment.GetEnvironmentVariable("REACT_APP_DATABASE_HOST");
                string dataBaseStr = Environment.GetEnvironmentVariable("REACT_APP_DATABASE_DATABASE");
                return $"Server={hostStr};Database={dataBaseStr};User Id={userStr};Password={passStr};";
            }
        }
    }
}