using System
using System.Data.SqlClient;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Server
{
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
                        builder.WithOrigins(
                            "http://localhost:3000",
                            "http://localhost:3000/MyAccount/*",
                            "http://localhost:3000/",
                            "http://localhost:3000/StoreFront",
                            "http://localhost:3000/Cart"
                        )
                        .AllowAnyMethod()
                        .WithHeaders("Authorization");
                        .AllowCredentials();
                    });
            });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseRouting();
            app.UseCors("AllowSpecificOrigins");
            app.UseAuthorization();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });

            string portStr = Environment.GetEnvironmentVariable("PORT") ?? "3001";
            int port = int.Parse(portStr);
            var listener = new HttpListener();
            listener.Prefixes.Add($"http://localhost:{port}/");
            Console.WriteLine($"Server running on port {port}");
            listener.Start();

            string userStr = Environment.GetEnvironmentVariable("REACT_APP_DATABASE_USER");
            string passStr = Environment.GetEnvironmentVariable("REACT_APP_DATABASE_PASSWORD");
            string hostStr = Environment.GetEnvironmentVariable("REACT_APP_DATABASE_HOST");
            string dataBaseStr = Environment.GetEnvironmentVariable("REACT_APP_DATABASE_DATABASE");
            using (var conn = new SqlConnection($"Data Source={hostStr};Initial Catalog={dataBaseStr};User ID={userStr};Password={passStr}"))
            {
                conn.Open();
            }
        }
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
        public ActionResult<IEnumerable<string>> GetStoreItems()
        {
            string userStr = Environment.GetEnvironmentVariable("REACT_APP_DATABASE_USER");
            string passStr = Environment.GetEnvironmentVariable("REACT_APP_DATABASE_PASSWORD");
            string hostStr = Environment.GetEnvironmentVariable("REACT_APP_DATABASE_HOST");
            string dataBaseStr = Environment.GetEnvironmentVariable("REACT_APP_DATABASE_DATABASE");

            string connectionString = $"Server={hostStr};Database={dataBaseStr};User Id={userStr};Password={passStr};";

            string queryStatement = "SELECT * FROM storeItems";

            List<StoreItem> storeItems = new List<StoreItem>();

            using(SqlConnection connection = new SqlConnection(connectionString))
            {
                using(SqlCommand command = new SqlCommand(queryStatement, connection)){
                    try
                    {
                        connection.Open();
                        SqlDataReader reader = command.ExecuteReader();

                        while (reader.read()){
                            StoreItem item = new StoreItem
                            {
                                ItemID = reader.GetInt32(reader.GetOrdinal("itemID")),
                                ItemName = reader.GetString(reader.GetOrdinal("itemName")),
                                ItemPrice = reader.GetDecimal(reader.GetOrdinal("itemPrice")),
                                ImagePath = reader.GetString(reader.GetOrdinal("imagePath")),
                                ItemDescription = reader.GetString(reader.GetOrdinal("itemDescription"))
                            }
                            storeItems.add(item)
                        }

                        reader.close();
                    }
                    catch (Exception ex)
                    {
                        return BadRequest("Error: " + ex.message)
                    }
                }
            }
            return Ok(storeItems)
        }
    }
}