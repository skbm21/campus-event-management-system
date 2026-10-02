using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

public class RegistrationService
{
    private readonly string _connectionString;

    public RegistrationService(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("CampusEvents")
            ?? throw new InvalidOperationException(
                "Connection string 'CampusEvents' is not configured.");
    }

    /// <summary>
    /// Returns the registration ID for the given email, or null if none exists.
    /// </summary>
    public string? GetUserRegistration(string inputEmail)
    {
        if (string.IsNullOrWhiteSpace(inputEmail))
            throw new ArgumentException("Email is required.", nameof(inputEmail));

        const string sql =
            "SELECT RegistrationId FROM Registrations WHERE Email = @Email";

        using var conn = new SqlConnection(_connectionString);
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.Add("@Email", SqlDbType.NVarChar, 254).Value = inputEmail;

        conn.Open();
        using var reader = cmd.ExecuteReader();

        return reader.Read()
            ? reader.GetValue(0).ToString()
            : null; // no row found
    }
}
