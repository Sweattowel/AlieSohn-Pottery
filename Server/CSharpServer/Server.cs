using System;
using System.IO;
using System.Text;
using System.Data.Common;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
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
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Logging;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
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
                Timer timer = new Timer(UpdateItems, null, TimeSpan.Zero, TimeSpan.FromMinutes(30));
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
        public static void UpdateItems(object state)
        {
            try
            {
                Console.WriteLine("Updating Brochure");
                DatabaseUtilities.CreateBrochure();
                Console.WriteLine("Updating StoreItems");
                DatabaseUtilities.CreateStoreListings();
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
            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(Path.Combine(env.ContentRootPath, "StoreImages")),
                RequestPath = "/StoreImages"
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
    public static class PreGetStorage
    {
        public static List<BrochureItem> Brochure { get; set; }
        public static List<StoreItem> StoreListings { get; set; }
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
                PreGetStorage.Brochure = brochure;
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
        public static void CreateStoreListings()
        {
            try
            {
                string connectionString = ConnectionString.GetConnectionString();
                string queryStatement = "SELECT * FROM storeItems";
                List<StoreItem> storeItems = new List<StoreItem>();

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
                PreGetStorage.StoreListings = storeItems;
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
        public ActionResult<IEnumerable<StoreItem>> GetStoreItems()
        {
            Console.WriteLine("Received Request for StoreListings");
            try
            {   
                var data = PreGetStorage.StoreListings;
                return Ok(data);
            }
            catch (Exception ex)
            {
                // Log the error
                Console.WriteLine($"Error retrieving store items: {ex.Message}");
                return StatusCode(500, "Internal Server Error");
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
                return Ok(PreGetStorage.Brochure);
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
        public static string Encrypt(string password)
        {
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(password, 10);
            return hashedPassword;
        }

        // DECRYPT PASSWORD
        public static bool Decrypt(string password, string hashedPassword)
        {
            bool passwordMatches = BCrypt.Net.BCrypt.Verify(password, hashedPassword);
            return passwordMatches;
        }
    }
    ////// TOKEN HANDLE
    // TOKEN REFRESH
    [Route("/api/TokenRefresh")]
    [ApiController]
    public class TokenRefreshController : ControllerBase
    {
        public class TokenRefreshRequestModel
        {
            public int UserID { get; set; }
            public string UserName { get; set; }
        }
        [HttpPost]
        public async Task<ActionResult> TokenRefresh([FromBody] TokenRefreshRequestModel requestModel)
        {
            try
            {
                if (requestModel.UserID <= 0)
                {
                    return BadRequest("Invalid UserID.");
                }

                if (string.IsNullOrWhiteSpace(requestModel.UserName))
                {
                    return BadRequest("UserName cannot be empty or whitespace.");
                }

                var authorizationHeader = HttpContext.Request.Headers["Authorization"];
                if (string.IsNullOrEmpty(authorizationHeader))
                {
                    Console.WriteLine("Failed to verify");
                    return StatusCode(401, "Unauthorized");
                }
                var token = authorizationHeader.ToString().Replace("Bearer ", "");

                DateTime expirationTime = ValidateAndExtractExpirationTime(token);

                TimeSpan timeUntilExpiration = expirationTime - DateTime.UtcNow;

                if(timeUntilExpiration <= TimeSpan.FromMinutes(5))
                {
                    string newToken = TokenHandler.CreateToken(requestModel.UserID, requestModel.UserName);
                    return Ok(newToken);
                }                
                else {
                    return Ok(token);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Token refresh failed: {ex.Message}");
                return StatusCode(500, "Failed to refresh");
            }
        }   
        private DateTime ValidateAndExtractExpirationTime(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var securityToken = tokenHandler.ReadToken(token) as JwtSecurityToken;
            var expirationTime = securityToken.ValidTo.ToUniversalTime();
            return expirationTime;
        }
    }    
    // TOKEN HANDLER
    public class TokenHandler
    {
        private static readonly string Secret = Environment.GetEnvironmentVariable("REACT_APP_TOKEN_SECRET");

        public static string CreateToken(int userID, string userName)
        {
            Console.WriteLine(Secret);
            var TokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(Secret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Name, userID.ToString()),
                    new Claim(ClaimTypes.NameIdentifier, userName)
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = TokenHandler.CreateToken(tokenDescriptor);
            var tokenString = TokenHandler.WriteToken(token);

            return tokenString;
        }

        public static bool VerifyToken(string token)
        {
            try
            {
                Console.WriteLine(Secret);
                var TokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(Secret);

                var tokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false, // Modify as needed
                    ValidateAudience = false, // Modify as needed
                    ValidateLifetime = true, // Ensure token hasn't expired
                    ClockSkew = TimeSpan.Zero // Set clock skew to zero so that tokens are only valid exactly at their expiration time
                };

                SecurityToken validatedToken;
                var principal = TokenHandler.ValidateToken(token, tokenValidationParameters, out validatedToken);

                // Token is valid
                return true;
            }
            catch (SecurityTokenException ex)
            {
                Console.WriteLine($"Security token exception: {ex.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Token validation failed: {ex.Message}");
            }
            // Token validation failed
            return false;
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
        public async Task<ActionResult> HandleLogin([FromBody] UserCredentials credentials)
        {
            string queryStatement = "SELECT userID, userName, passWord FROM userData WHERE userName = @UserName LIMIT 1";
            string connectionString = ConnectionString.GetConnectionString();
            try
            {                
                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    using (MySqlCommand command = new MySqlCommand(queryStatement, connection))
                    {
                        command.Parameters.AddWithValue("@UserName", credentials.UserName);
                        await connection.OpenAsync();
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            if (await reader.ReadAsync())
                            {
                                string hashedPassword = reader.GetString(reader.GetOrdinal("passWord"));
                                bool verify = BcryptEncryption.Decrypt(credentials.Password, hashedPassword);
                                if (verify)
                                {
                                    var userID = Convert.ToInt32(reader["userID"]);
                                    var userName = reader["userName"].ToString();
                                    var tokenString = TokenHandler.CreateToken(userID, userName);
                                    return Ok(new { token = tokenString, userID = userID, userName = userName });
                                }
                            }
                        }
                    }
                }
                return Unauthorized();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred during login: {ex.Message}");
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
                        string hashedPassword = BcryptEncryption.Encrypt(credentials.Password);
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

                if (!TokenHandler.VerifyToken(token))
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
                    using (DbDataReader reader = await command.ExecuteReaderAsync())
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
    public class DeleteAccountController : ControllerBase
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

                if (!TokenHandler.VerifyToken(token))
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
                            int rowsAffected = await deleteData.ExecuteNonQueryAsync();

                            if (rowsAffected > 0){
                                return Ok();
                            }  
                            else
                            {
                                return StatusCode(404, "Not found");
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
                string queryStatement = "SELECT adminID, userName, passWord FROM admins WHERE userName = @UserName";
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
                                bool verify = BcryptEncryption.Decrypt(credentials.Password, hashedPassword);
                                if (!verify)
                                {
                                    return Unauthorized();
                                }

                                var adminID = Convert.ToInt32(reader["adminID"]);
                                var UserName = reader["userName"].ToString();

                                var tokenString = TokenHandler.CreateToken(adminID, UserName);

                                return Ok(new { token = tokenString, adminID = adminID, userName = UserName });
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

                if (!TokenHandler.VerifyToken(token))
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
                        string hashedPassword = BcryptEncryption.Encrypt(credentials.Password);
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
        private bool IsImageExtension(string extension)
        {
            return extension.Equals(".png", StringComparison.OrdinalIgnoreCase) ||
                extension.Equals(".jpg", StringComparison.OrdinalIgnoreCase) ||
                extension.Equals(".jpeg", StringComparison.OrdinalIgnoreCase) ||
                extension.Equals(".gif", StringComparison.OrdinalIgnoreCase) ||
                extension.Equals(".bmp", StringComparison.OrdinalIgnoreCase);
        }
        public class CreateItemRequest
        {
            public string ItemName { get; set; }
            public string ItemDescription { get; set; }
            public decimal ItemPrice { get; set; }
            public IFormFile Picture { get; set; }
        }        
        
        [HttpPost]
        public async Task<ActionResult> CreateItem([FromForm] CreateItemRequest createItemRequest)
        {

            try
            {
                if (string.IsNullOrEmpty(createItemRequest.ItemName) || 
                string.IsNullOrEmpty(createItemRequest.ItemDescription) || 
                createItemRequest.ItemPrice == 0 || 
                createItemRequest.Picture == null)
                {
                    return StatusCode(404, "Missing parameters in item creation");
                }
                
                Console.WriteLine("Received createItem request, verifying token");
                var authorizationHeader = HttpContext.Request.Headers["Authorization"];
                if (string.IsNullOrEmpty(authorizationHeader))
                {
                    Console.WriteLine("Failed to verify");
                    return StatusCode(401, "Unauthorized");
                }

                var token = authorizationHeader.ToString().Replace("Bearer ", "");

                if (!TokenHandler.VerifyToken(token))
                {
                    Console.WriteLine("Failed to verify");
                    return StatusCode(401, "Unauthorized");
                }

                
                if (createItemRequest.Picture == null || createItemRequest.Picture.Length == 0)
                {
                    Console.WriteLine("No image file found in the request");
                    return BadRequest("No image file found in the request");
                }
                string extension = Path.GetExtension(createItemRequest.Picture.FileName);
                
                if (extension == null || !IsImageExtension(extension))
                {
                    return StatusCode(401, "Unauthorized File type");
                }
                string imageFileName = $"{Guid.NewGuid()}.{GetFileExtension(createItemRequest.Picture.FileName)}";
                string imagePath = Path.Combine("StoreImages", imageFileName);

                string fullPath = Path.Combine(Directory.GetCurrentDirectory(), "StoreImages", imageFileName);
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await createItemRequest.Picture.CopyToAsync(stream);
                }

                string queryStatement = "INSERT INTO storeItems (itemName, itemDescription, itemPrice, imagePath) VALUES (@ItemName, @ItemDescription, @ItemPrice, @ImagePath)";
                string connectionString = ConnectionString.GetConnectionString();

                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    await connection.OpenAsync();

                    using (MySqlCommand command = new MySqlCommand(queryStatement, connection))
                    {
                        command.Parameters.AddWithValue("@ItemName", createItemRequest.ItemName);
                        command.Parameters.AddWithValue("@ItemDescription", createItemRequest.ItemDescription);
                        command.Parameters.AddWithValue("@ItemPrice", createItemRequest.ItemPrice);
                        command.Parameters.AddWithValue("@ImagePath", imagePath);

                        int rowsAffected = await command.ExecuteNonQueryAsync();

                        if (rowsAffected > 0)
                        {
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
        public async Task<ActionResult> DeleteItem(int itemId)
        {
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

                if (!TokenHandler.VerifyToken(token))
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
                                string fullPath = Path.Combine(Directory.GetCurrentDirectory(), "StoreImages", imagePath);
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
                            return StatusCode(404, "Not found");
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
        public DateTime OrderDate { get; set; }  // Change type to DateTime     
    }

    // ORDER CREATION
    [Route("/api/createOrder")]
    [ApiController]
    public class CreateOrderController : ControllerBase
    {
        [HttpPost]
        public async Task<ActionResult> CreateOrder([FromBody] Order order)
        {
            try
            {
                Console.WriteLine("Received createOrder request, verifying token");
                string authorizationHeader = HttpContext.Request.Headers["Authorization"];
                if (string.IsNullOrEmpty(authorizationHeader))
                {
                    Console.WriteLine("Failed to verify: Authorization header is missing");
                    return StatusCode(401, "Unauthorized: Authorization header is missing");
                }

                string token = authorizationHeader.Replace("Bearer ", "");
                if (!TokenHandler.VerifyToken(token))
                {
                    Console.WriteLine("Failed to verify: Invalid token");
                    return StatusCode(401, "Unauthorized: Invalid token");
                }

                if (string.IsNullOrEmpty(order.UserName)|| order == null || order.ItemIDs == null || order.ItemIDs.Count == 0)
                {
                    Console.WriteLine("Failed to create order: Invalid input data");
                    return BadRequest("Invalid input data");
                }

                string queryStatement = "INSERT INTO orders (userName, userID, itemID, orderDate) VALUES (@UserName, @UserID, @ItemID, @OrderDate)";
                string connectionString = ConnectionString.GetConnectionString();

                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    await connection.OpenAsync();

                    foreach (int itemID in order.ItemIDs)
                    {
                        using (MySqlCommand command = new MySqlCommand(queryStatement, connection))
                        {
                            command.Parameters.AddWithValue("@UserName", order.UserName);
                            command.Parameters.AddWithValue("@UserID", order.UserID);
                            command.Parameters.AddWithValue("@ItemID", itemID);
                            command.Parameters.AddWithValue("@OrderDate", order.OrderDate.ToString("yyyy-MM-dd HH:mm:ss")); // Format date properly

                            await command.ExecuteNonQueryAsync();
                        }
                    }

                    return Ok();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred: {ex.Message}");
                return StatusCode(500, "Internal Server Error");
            }
        }
    }

    // GET ORDERS
    [Route("/api/orders/{userId}")]
    [ApiController]
    public class GetOrdersController : ControllerBase
    {
        public class IndividualOrders
        {
            public int OrderID { get; set; }
            public int ItemID { get; set; }
            public string ItemName { get; set; }
            public DateTime OrderDate { get; set; }
            public bool Completed { get; set; }
        }

        [HttpGet]
        public async Task<ActionResult<List<IndividualOrders>>> GetOrders(int userId)
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

                if (!TokenHandler.VerifyToken(token))
                {
                    Console.WriteLine("Failed to verify");
                    return StatusCode(401, "Unauthorized");
                }

                string queryStatement = "SELECT storeItems.itemName, orders.itemID, orders.orderID, orders.orderDate, completed FROM orders LEFT JOIN storeItems ON storeItems.itemID = orders.itemID WHERE userID = @UserId";
                string connectionString = ConnectionString.GetConnectionString();
                List<IndividualOrders> orders = new List<IndividualOrders>();

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
                                IndividualOrders order = new IndividualOrders
                                {
                                    OrderID = reader.GetInt32(reader.GetOrdinal("orderID")),
                                    ItemID = reader.GetInt32(reader.GetOrdinal("itemID")),
                                    ItemName = reader.GetString(reader.GetOrdinal("itemName")),
                                    OrderDate = reader.GetDateTime(reader.GetOrdinal("orderDate")),
                                    Completed = reader.GetBoolean(reader.GetOrdinal("completed")),
                                };
                                orders.Add(order);
                            }
                        }
                    }
                }
                return Ok(orders);
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
    public class UpdateOrderController : ControllerBase
    {
        public class ChosenOrder
        {
            public bool completed { get; set; }
            public int orderID { get; set; }
            public int userID { get; set; }
        }
        [HttpPost]
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

                if (!TokenHandler.VerifyToken(token))
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
                            return StatusCode(404, "Not found");
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