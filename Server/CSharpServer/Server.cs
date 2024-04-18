using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using MySql.Data.MySqlClient;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using DotNetEnv;
using BCrypt;
using Server.Controllers;
using Server;


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
                            .UseUrls(Environment.GetEnvironmentVariable("REACT_APP_SERVER_ADDRESS"));
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
                    "http://192.168.0.254:3000")
                    .AllowAnyMethod()
                    .AllowAnyHeader();
                    });
            });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseStaticFiles( new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider("/var/www/AlieSohn/Server/CSharpServer/StoreImages")
            });
            app.UseRouting();
            app.UseCors("AllowAll");
            app.UseAuthorization();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
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
    public class StoreItem
    {
        public int ItemID { get; set; }
        public string ItemName { get; set; }
        public decimal ItemPrice { get; set; }
        public string ImagePath { get; set; }
        public string ItemDescription { get; set; }
    }
    // method for getting database variables
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

}
namespace Server.Controllers
{
    //////// ROUTES
    // GET STOREITEMS
    [Route("/api/storeItems")]
    [ApiController]
    public class StoreItemsController : ControllerBase
    {
        [HttpGet]
        [HttpPost]
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
        [HttpPost]
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
    // PASSWORD HASHING AND ENCRYPTION
    public class BcryptEncryption
    {
        // ENCRYPT PASSWORD
        public static async Task<string> Encrypt(string passWord)
        {
            string hashedPassword = await BCrypt.Net.BCrypt.HashPasswordAsync(password, 10);
            return hashedPassword;
        }
        // DECRYPT PASSWORD
        public static async Task<bool> Decrypt(string passWord, string HashedPassword)
        {
            bool passwordMatches = await BCrypt.Net.BCrypt.VerifyAsync(password, hashedPassword);
            return passwordMatches;
        }
    }

    // TOKEN HANDLER
    public class tokenHandle 
    {
        private static readonly string Secret = Environment.GetEnvironmentVariable("REACT_APP_TOKEN_SECRET");

        // TOKEN CREATION
        public static string CreateToken(int UserID, string UserName)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(Secret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Name, UserID.ToString()),
                    new Claim(ClaimTypes.NameIdentifier, UserName)
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return tokenString;
        }
        // VERIFY TOKEN
        public static bool VerifyToken(string Token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(Secret);
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false
            };

            try
            {
                var principal = tokenHandler.ValidateToken(Token, tokenValidationParameters, out _);
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Token validation failed: {ex.Message}");
                return false;
            }
        }
    }
    ////// ACCOUNT HANDLE NORMAL
    public class UserCredentials
    {
        public string UserName { get; set; }
        public string Password { get; set; }
        public string Token { get; set; }
    }
    // LOGIN
    [Route("/api/login")]
    [ApiController]
    public class UserLogInController: ControllerBase
    {
        [HttpPost]
        public async Task<ActionResult<IEnumerable<T>>> HandleLogin([FromBody] UserCredentials credentials)
        {
            Console.WriteLine("Received login normal request");
            string queryStatement = "SELECT userID, userName, passWord FROM userData WHERE userName = @UserName AND passWord = @Password LIMIT 1";
            string connectionString = ConnectionString.GetConnectionString();
            try
            {                
                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    using (MySqlCommand command = new MySqlCommand(queryStatement, connection))
                    {
                        command.Parameters.AddWithValue("@UserName", credentials.UserName);
                        command.Parameters.AddWithValue("@Password", credentials.Password);
                        await connection.OpenAsync();
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            if (await reader.ReadAsync())
                            {
                                string hashedPassword = reader.GetString(reader.GetOrdinal("passWord"));
                                bool verify = await BcryptEncryption.Decrypt(credentials.Password, hashedPassword);
                                if (!verify)
                                {
                                    return Unauthorized();
                                }
                                var userID = Convert.ToInt32(reader["userID"]);
                                var userName = reader["userName"].ToString();

                                var tokenString = tokenHandle.CreateToken(userID, userName);

                                return Ok(new { token = tokenString, userID = userID, userName = userName });
                            }
                            else
                            {
                                return Unauthorized();
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred during registration: {ex.Message}");
                return StatusCode(500, "Internal Server Error");
            }
        }
    }
    // REGISTRATION
    [Route("/api/register")]
    [ApiController]
    public class UserRegisterController: ControllerBase
    {
        [HttpPost]
        public async Task<ActionResult> HandleRegister([FromBody] UserCredentials credentials)
        {
            try
            {
                Console.WriteLine("Received register normal request");
                string queryCreateUser = @"
                    INSERT INTO userData (userName, passWord)
                    SELECT @UserName, @Password
                    WHERE NOT EXISTS (
                        SELECT 1 FROM userData WHERE userName = @UserName
                    );
                    SELECT ROW_COUNT();";
                string connectionString = ConnectionString.GetConnectionString();

                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    await connection.OpenAsync();

                    using (MySqlCommand commandCreateUser = new MySqlCommand(queryCreateUser, connection))
                    {
                        string hashedPassword = await BcryptEncryption.Encrypt(credentials.Password);
                        commandCreateUser.Parameters.AddWithValue("@UserName", credentials.UserName);
                        commandCreateUser.Parameters.AddWithValue("@Password", hashedPassword);

                        int rowsAffected = Convert.ToInt32(await commandCreateUser.ExecuteScalarAsync());

                        if (rowsAffected > 0) 
                        {
                            return Ok("User successfully created");
                        } 
                        else 
                        {
                            return Conflict("User already exists");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred during registration: {ex.Message}");
                return StatusCode(500, "Internal Server Error");
            }
        }
    }
    // GET USERS
    [Route("/api/getUsers")]
    [ApiController]
    public class GetUserController : ControllerBase
    {
        public class User
        {
            public int UserID { get; set; }
            public string UserName { get; set; }
        }

        public async Task<ActionResult<List<User>>> GetUsers()
        {
            try
            {      
                Console.WriteLine("Received GetUsers request, verifying token");
                var authorizationHeader = HttpContext.Request.Headers["Authorization"];
                if (string.IsNullOrEmpty(authorizationHeader))
                {
                    Console.WriteLine("Failed to verify");
                    return StatusCode(401, "Unauthorized");
                }
                var token = authorizationHeader.ToString().Replace("Bearer ", "");

                if (!TokenHandle.VerifyToken(token))
                {
                    Console.WriteLine("Failed to verify");
                    return StatusCode(401, "Unauthorized");
                }

                
                string queryStatement = "SELECT userID, userName FROM userData";
                string connectionString = ConnectionString.GetConnectionString();
                List<User> users = new List<User>();

                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    await connection.OpenAsync();
                    using (MySqlCommand command = new MySqlCommand(queryStatement, connection))
                    using (MySqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            User user = new User
                            {
                                UserID = reader.GetInt32(reader.GetOrdinal("userID")),
                                UserName = reader.GetString(reader.GetOrdinal("userName")),
                            };
                            users.Add(user);
                        }
                    }
                }
                return Ok(users);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred during user retrieval: {ex.Message}");
                return StatusCode(500, "Internal Server Error");
            }
        }
    }
    // DELETE ACCOUNT
    [Route("/api/deleteAccount/{userID}")]
    [ApiController]
    public class DeleteAccountController
    {
        public async Task<ActionResult> DeleteAccount(int userID)
        {
            try
            {
                Console.WriteLine("Received account delete, verifying token");
                var authorizationHeader = HttpContext.Request.Headers["Authorization"];
                if (string.IsNullOrEmpty(authorizationHeader))
                {
                    Console.WriteLine("Failed to verify");
                    return StatusCode(401, "Unauthorized");
                }
                var token = authorizationHeader.ToString().Replace("Bearer ", "");

                if (!TokenHandle.VerifyToken(token))
                {
                    Console.WriteLine("Failed to verify");
                    return StatusCode(401, "Unauthorized");
                }

                string queryStatementUserOrder = "DELETE FROM orders WHERE userID = @UserID";
                string queryStatementUserData = "DELETE FROM userData WHERE userID = @UserID";
                string connectionString = ConnectionString.GetConnectionString();      

                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    await connection.OpenAsync();
                    using (MySqlCommand deleteOrders = new MySqlCommand(queryStatementUserOrder, connection))
                    {
                        deleteOrders.Parameters.AddWithValue("@UserID", userID);
                        await deleteOrders.ExecuteNonQueryAsync();

                        using (MySqlCommand deleteData = new MySqlCommand(queryStatementUserData, connection))
                        {
                            deleteData.Parameters.AddWithValue("@UserID", userID);
                            int rowsAffected = deleteData.ExecuteNonQueryAsync();

                            if (rowsAffected > 0){
                                return Ok();
                            }  
                            else
                            {
                                return NotFound("User not found");
                            }
                        }
                    }
                }          
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred during user retrieval: {ex.Message}");
                return StatusCode(500, "Internal Server Error");
            }
        }
    }


    ////// ACCOUNT HANDLE SUPER
    // LOGIN SUPER
    [Route("/api/adminLogin")]
    [ApiController]
    public class UserSuperLogInController : ControllerBase
    {
        [HttpPost]
        public async Task<ActionResult> HandleSuperLogin([FromBody] UserCredentials credentials)
        {
            try
            {
                Console.WriteLine("Received login super request");
                string queryStatement = "SELECT userName, passWord FROM admins WHERE userName = @UserName";
                string connectionString = ConnectionString.GetConnectionString();

                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    await connection.OpenAsync();

                    using (MySqlCommand command = new MySqlCommand(queryStatement, connection))
                    {
                        command.Parameters.AddWithValue("@UserName", credentials.UserName);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            if (await reader.ReadAsync())
                            {
                                string hashedPassword = reader.GetString(reader.GetOrdinal("passWord"));
                                bool verify = await BcryptEncryption.Decrypt(credentials.Password, hashedPassword);
                                if (!verify)
                                {
                                    return Unauthorized();
                                }

                                var UserID = Convert.ToInt32(reader["userID"]);
                                var UserName = reader["userName"].ToString();

                                var tokenString = tokenHandle.CreateToken(UserID, UserName);

                                return Ok(new { token = tokenString, userID = UserID, userName = UserName });
                            }
                            else
                            {
                                return Unauthorized();
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred during login: {ex.Message}");
                return StatusCode(500, "Internal Server Error");
            }
        }
    }
    // REGISTRATION SUPER
    [Route("/api/adminRegistration")]
    [ApiController]
    public class UserSuperRegisterController: ControllerBase
    {
        [HttpPost]
        public async Task<ActionResult> HandleSuperRegister([FromBody] UserCredentials credentials)
        {
            try
            {
                Console.WriteLine("Received register super request, verifying token");
                var authorizationHeader = HttpContext.Request.Headers["Authorization"];
                if (string.IsNullOrEmpty(authorizationHeader))
                {
                    Console.WriteLine("Failed to verify");
                    return StatusCode(401, "Unauthorized");
                }
                var token = authorizationHeader.ToString().Replace("Bearer ", "");

                if (!TokenHandle.VerifyToken(token))
                {
                    Console.WriteLine("Failed to verify");
                    return StatusCode(401, "Unauthorized");
                }

                string queryStatement = "INSERT INTO admins (userName, passWord) SELECT @UserName, @Password WHERE NOT EXISTS (SELECT 1 FROM admins WHERE userName = @UserName)";
                string connectionString = ConnectionString.GetConnectionString();

                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    await connection.OpenAsync();

                    using (MySqlCommand command = new MySqlCommand(queryStatement, connection))
                    {
                        string hashedPassword = await BcryptEncryption.Encrypt(credentials.Password);
                        command.Parameters.AddWithValue("@UserName", credentials.UserName);
                        command.Parameters.AddWithValue("@Password", hashedPassword);

                        int rowsAffected = await command.ExecuteNonQueryAsync();
                        if (rowsAffected > 0)
                        {
                            return Ok("Super user successfully registered");
                        }
                        else
                        {
                            return StatusCode(500, "Internal Server Error: Failed to register super user");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred during super user registration: {ex.Message}");
                return StatusCode(500, "Internal Server Error");
            }
        }
    }
    ////// STORE ITEM HANDLER
    // ITEM CREATION
    [Route("/api/createItem")]
    [ApiController]
    public class CreateItemController : ControllerBase
    {  
        private string GetFileExtension(string fileName)
        {
            return Path.GetExtension(fileName).TrimStart('.');
        }
        [HttpPost]
        public async Task<ActionResult> CreateItem([FromForm] StoreItem storeItem)
        {
            try
            {
                Console.WriteLine("Received createItem request, verifying token");
                var authorizationHeader = HttpContext.Request.Headers["Authorization"];
                if (string.IsNullOrEmpty(authorizationHeader))
                {
                    Console.WriteLine("Failed to verify");
                    return StatusCode(401, "Unauthorized");
                }
                var token = authorizationHeader.ToString().Replace("Bearer ", "");

                if (!TokenHandle.VerifyToken(token))
                {
                    Console.WriteLine("Failed to verify");
                    return StatusCode(401, "Unauthorized");
                }

                string imagePath = $"{Guid.NewGuid()}.{GetFileExtension(storeItem.Image.FileName)}";
                string fullPath = Path.Combine("/StoreImages", imagePath); // Path where images will be stored

                string queryStatement = "INSERT INTO storeItems (itemName, itemDescription, itemPrice, imagePath) VALUES (@ItemName, @ItemDescription, @ItemPrice, @ImagePath)";
                string connectionString = ConnectionString.GetConnectionString();
                
                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    await connection.OpenAsync();
                    
                    using (MySqlCommand command = new MySqlCommand(queryStatement, connection))
                    {
                        command.Parameters.AddWithValue("@ItemName", storeItem.ItemName);
                        command.Parameters.AddWithValue("@ItemDescription", storeItem.ItemDescription);
                        command.Parameters.AddWithValue("@ItemPrice", storeItem.ItemPrice);
                        command.Parameters.AddWithValue("@ImagePath", imagePath);
                        
                        int rowsAffected = await command.ExecuteNonQueryAsync();
                        if (rowsAffected > 0)
                        {
                            // Save the uploaded image file to the generated image path
                            using (var stream = new FileStream(fullPath, FileMode.Create))
                            {
                                await storeItem.Image.CopyToAsync(stream);
                            }

                            return Ok("Item successfully entered");
                        }
                        else
                        {
                            return StatusCode(500, "Internal Server Error: Failed to create item");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred during item creation: {ex.Message}");
                return StatusCode(500, "Internal Server Error");
            }
        }
    }
    // ITEM DELETION
    [Route("/api/deleteItem/{itemId}")]
    [ApiController]
    public class DeleteItemController : ControllerBase
    {  
        [HttpDelete]
        public async Task<ActionResult> DeleteItem([FromBody] dynamic requestBody)
        {
            int itemId = requestBody.storeItemID;
            try
            {
                Console.WriteLine($"Received deleteItem request for item ID: {itemId}, verifying token");
                var authorizationHeader = HttpContext.Request.Headers["Authorization"];
                if (string.IsNullOrEmpty(authorizationHeader))
                {
                    Console.WriteLine("Failed to verify");
                    return StatusCode(401, "Unauthorized");
                }
                var token = authorizationHeader.ToString().Replace("Bearer ", "");

                if (!TokenHandle.VerifyToken(token))
                {
                    Console.WriteLine("Failed to verify");
                    return StatusCode(401, "Unauthorized");
                }

                string queryGetImagePath = "SELECT imagePath FROM storeItems WHERE itemId = @ItemId";
                string queryDeleteItem = "DELETE FROM storeItems WHERE itemId = @ItemId";
                string queryDeleteOrders = "DELETE FROM orders WHERE itemID = @ItemId"; // SQL query to delete references in the orders table
                string connectionString = ConnectionString.GetConnectionString();
                
                string imagePath = null;
                
                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    await connection.OpenAsync();

                    using (MySqlCommand commandGetImagePath = new MySqlCommand(queryGetImagePath, connection))
                    {
                        commandGetImagePath.Parameters.AddWithValue("@ItemId", itemId);
                        imagePath = (string)await commandGetImagePath.ExecuteScalarAsync();
                    }

                    using (MySqlCommand commandDeleteItem = new MySqlCommand(queryDeleteItem, connection))
                    {
                        commandDeleteItem.Parameters.AddWithValue("@ItemId", itemId);
                        int rowsAffected = await commandDeleteItem.ExecuteNonQueryAsync();
                        
                        if (rowsAffected > 0)
                        {
                            if (!string.IsNullOrEmpty(imagePath))
                            {
                                string fullPath = Path.Combine("path_to_images_folder", imagePath);
                                if (System.IO.File.Exists(fullPath))
                                {
                                    System.IO.File.Delete(fullPath);
                                    Console.WriteLine($"Deleted image file: {fullPath}");
                                }
                            }
                            using (MySqlCommand commandDeleteOrders = new MySqlCommand(queryDeleteOrders, connection))
                            {
                                commandDeleteOrders.Parameters.AddWithValue("@ItemId", itemId);
                                await commandDeleteOrders.ExecuteNonQueryAsync();
                            }
                            return Ok("Item successfully deleted");
                        }
                        else
                        {
                            return NotFound("Item not found");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred during item deletion: {ex.Message}");
                return StatusCode(500, "Internal Server Error");
            }
        }
    }
    ////// ORDER HANDLING
    public class Order
    {
        public string UserName { get; set; }        
        public int UserID { get; set; }        
        public List<int> ItemIDs { get; set; }       
        public string OrderDate { get; set; }      
        public bool completed { get; set; }
    }
    // ORDER CREATION
    [Route("/api/createOrder")]
    [ApiController]
    public class CreateOrderController
    {
        public async Task<ActionResult> CreateOrder([FromBody] Order order)
        {
            try
            {
                Console.WriteLine("Received createOrder request, verifying token");
                var authorizationHeader = HttpContext.Request.Headers["Authorization"];
                if (string.IsNullOrEmpty(authorizationHeader))
                {
                    Console.WriteLine("Failed to verify");
                    return StatusCode(401, "Unauthorized");
                }
                var token = authorizationHeader.ToString().Replace("Bearer ", "");

                if (!TokenHandle.VerifyToken(token))
                {
                    Console.WriteLine("Failed to verify");
                    return StatusCode(401, "Unauthorized");
                }

                string queryStatement = "INSERT INTO orders (userName, userID, itemID, orderDate) VALUES ( @UserName, @UserID, @ItemID, @OrderDate)";
                string connectionString = ConnectionString.GetConnectionString();

                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    await connection.OpenAsync();
                    foreach (int ItemID in order.ItemIDs)
                    {
                        using (MySqlCommand command = new MySqlCommand(queryStatement, connection))
                        {
                            command.Parameters.AddWithValue("@UserName", order.UserName);
                            command.Parameters.AddWithValue("@UserID", order.UserID);
                            command.Parameters.AddWithValue("@ItemID", ItemID);
                            command.Parameters.AddWithValue("@OrderDate", order.OrderDate);

                            await command.ExecuteNonQueryAsync();
                        }
                    }

                    return Ok();
                }
            }        
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred during item deletion: {ex.Message}");
                return StatusCode(500, "Internal Server Error");
            }
        }
    }        
    // GET ORDERS
    [Route("/api/orders/{userId}")]
    [ApiController]
    public class GetOrdersController : ControllerBase
    {
        [HttpPost]
        public async Task<ActionResult<List<Order>>> GetOrders(int userId)
        {
            try
            {
                Console.WriteLine("Received getOrders request, verifying token");
                var authorizationHeader = HttpContext.Request.Headers["Authorization"];
                if (string.IsNullOrEmpty(authorizationHeader))
                {
                    Console.WriteLine("Failed to verify");
                    return StatusCode(401, "Unauthorized");
                }
                var token = authorizationHeader.ToString().Replace("Bearer ", "");

                if (!TokenHandle.VerifyToken(token))
                {
                    Console.WriteLine("Failed to verify");
                    return StatusCode(401, "Unauthorized");
                }

                string queryStatement = "SELECT storeItems.itemName, orders.itemID, orders.orderID, orders.orderDate, completed FROM orders LEFT JOIN storeItems ON storeItems.itemID = orders.itemID WHERE userID = @UserID";
                string connectionString = ConnectionString.GetConnectionString();
                List<Order> Orders = new List<Order>();

                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    await connection.OpenAsync();

                    using (MySqlCommand command = new MySqlCommand(queryStatement, connection))
                    {
                        command.Parameters.AddWithValue("@UserId", userId);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (reader.Read())
                            {
                                Order order = new Order
                                {
                                    ItemID = reader.GetInt32(reader.GetOrdinal("itemID")),
                                    OrderID = reader.GetInt32(reader.GetOrdinal("orderID")),
                                    OrderDate = reader.GetDateTime(reader.GetOrdinal("orderDate")),
                                    Completed = reader.GetBoolean(reader.GetOrdinal("completed")),
                                };
                                orders.Add(order);
                            }
                        }
                    }
                }
                return Ok(Orders);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred during item deletion: {ex.Message}");
                return StatusCode(500, "Internal Server Error");
            }

        }
    }
    // COMPLETE ORDER
    [Route("/api/completeOrder")]
    [ApiController]
    public class UpdateOrderController
    {
        public class ChosenOrder
        {
            public bool completed { get; set; }
            public int orderID { get; set; }
            public int userID { get; set; }
        }
        public async Task<ActionResult> UpdateOrder([FromBody] ChosenOrder OrderDetails)
        {
            try
            {
                Console.WriteLine("Received order update request, verifying token");
                var authorizationHeader = HttpContext.Request.Headers["Authorization"];
                if (string.IsNullOrEmpty(authorizationHeader))
                {
                    Console.WriteLine("Failed to verify");
                    return StatusCode(401, "Unauthorized");
                }
                var token = authorizationHeader.ToString().Replace("Bearer ", "");

                if (!TokenHandle.VerifyToken(token))
                {
                    Console.WriteLine("Failed to verify");
                    return StatusCode(401, "Unauthorized");
                }

                string queryStatement = "UPDATE orders SET completed = @Completed WHERE orderID = @OrderID AND userID = @UserID";
                string connectionString = ConnectionString.GetConnectionString();
                
                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    await connection.OpenAsync();

                    using (MySqlCommand command = new MySqlCommand(queryStatement, connection))
                    {
                        command.Parameters.AddWithValue("@Completed", OrderDetails.completed);
                        command.Parameters.AddWithValue("@OrderID", OrderDetails.orderID);
                        command.Parameters.AddWithValue("@UserID", OrderDetails.userID);

                        int rowsAffected = await command.ExecuteNonQueryAsync();

                        if (rowsAffected == 1)
                        {
                            return Ok();
                        }
                        else
                        {
                            return NotFound();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred during item deletion: {ex.Message}");
                return StatusCode(500, "Internal Server Error");
            }  
        }
    }
}