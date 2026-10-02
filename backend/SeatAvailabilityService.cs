using Moq;
using Xunit;

public class SeatAvailabilityServiceTests
{
    private readonly Mock<IEventRepository> _repoMock = new();
    private readonly SeatAvailabilityService _sut;

    public SeatAvailabilityServiceTests()
    {
        _sut = new SeatAvailabilityService(_repoMock.Object);
    }

    private void Arrange(int eventId, int capacity, int registered)
    {
        _repoMock.Setup(r => r.GetById(eventId))
                 .Returns(new Event { Id = eventId, Capacity = capacity });
        _repoMock.Setup(r => r.GetRegistrationCount(eventId))
                 .Returns(registered);
    }

    [Fact]
    public void HasAvailableSeats_SeatsRemaining_ReturnsTrue()
    {
        Arrange(eventId: 1, capacity: 100, registered: 99);

        var result = _sut.HasAvailableSeats(1);

        Assert.True(result);
        _repoMock.Verify(r => r.GetById(1), Times.Once);
        _repoMock.Verify(r => r.GetRegistrationCount(1), Times.Once);
    }

    [Fact]
    public void HasAvailableSeats_ExactlyFull_ReturnsFalse()
    {
        Arrange(eventId: 2, capacity: 50, registered: 50);

        var result = _sut.HasAvailableSeats(2);

        Assert.False(result);
        _repoMock.Verify(r => r.GetById(2), Times.Once);
        _repoMock.Verify(r => r.GetRegistrationCount(2), Times.Once);
    }

    [Fact]
    public void HasAvailableSeats_OverCapacity_ReturnsFalse()
    {
        Arrange(eventId: 3, capacity: 50, registered: 55);

        var result = _sut.HasAvailableSeats(3);

        Assert.False(result);
        _repoMock.Verify(r => r.GetById(3), Times.Once);
        _repoMock.Verify(r => r.GetRegistrationCount(3), Times.Once);
    }

    [Fact]
    public void HasAvailableSeats_EventNotFound_ThrowsAndSkipsCount()
    {
        _repoMock.Setup(r => r.GetById(99)).Returns((Event?)null);

        Assert.Throws<KeyNotFoundException>(() => _sut.HasAvailableSeats(99));

        _repoMock.Verify(r => r.GetRegistrationCount(It.IsAny<int>()), Times.Never);
    }
}
