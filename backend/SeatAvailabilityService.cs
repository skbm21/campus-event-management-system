public class Event
{
    public int Id { get; set; }
    public int Capacity { get; set; }
}

public interface IEventRepository
{
    Event? GetById(int eventId);
    int GetRegistrationCount(int eventId);
}

public class SeatAvailabilityService
{
    private readonly IEventRepository _repository;

    public SeatAvailabilityService(IEventRepository repository)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
    }

    public bool HasAvailableSeats(int eventId)
    {
        var evt = _repository.GetById(eventId)
            ?? throw new KeyNotFoundException($"Event {eventId} was not found.");

        var registered = _repository.GetRegistrationCount(eventId);
        return registered < evt.Capacity;
    }
}
